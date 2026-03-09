import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import * as db from "./db";
import { logActivity } from "./db";
import { queryISeek, getEndpointForParam } from "./iseek";
import { consultarCPFCompleto, consultarFotosCPF } from "./iseek-cpf-completo";

const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(6),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = await db.getUserByEmail(input.email);
        
        if (!user || !user.password) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
        }

        const passwordMatch = await bcrypt.compare(input.password, user.password);
        if (!passwordMatch) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
        }

        if (user.isBlocked) {
          throw new TRPCError({ code: "FORBIDDEN", message: "User account is blocked" });
        }

        // Check if access expired
        if (user.expiresAt && new Date() > user.expiresAt) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access has expired" });
        }

        // Create session
        const token = uuidv4();
        const ipAddress = ctx.req?.ip || "unknown";
        const userAgent = ctx.req?.headers["user-agent"] || "unknown";
        
        await db.createSession(user.id, token, ipAddress, userAgent);
        await db.updateUser(user.id, { lastSignedIn: new Date() });
        await logActivity({
          userId: user.id,
          action: "login",
          ipAddress,
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res?.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 24 * 60 * 60 * 1000 });

        return {
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            accessMinutes: user.accessMinutes,
            usedMinutes: user.usedMinutes,
            expiresAt: user.expiresAt,
            isBlocked: user.isBlocked,
          },
        };
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res?.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    }),

    register: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().min(2),
      }))
      .mutation(async ({ input }) => {
        const existing = await db.getUserByEmail(input.email);
        if (existing) {
          throw new TRPCError({ code: "CONFLICT", message: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(input.password, 10);
        await db.createUser({
          email: input.email,
          password: hashedPassword,
          name: input.name,
          accessMinutes: 0,
        });

        return { success: true };
      }),
  }),

  queries: router({
    cpfCompleto: protectedProcedure
      .input(z.object({
        cpf: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = ctx.user;
        if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });

        if (user.isBlocked) {
          throw new TRPCError({ code: "FORBIDDEN", message: "User account is blocked" });
        }

        if (user.expiresAt && new Date() > user.expiresAt) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access has expired" });
        }

        const remainingMinutes = user.accessMinutes - user.usedMinutes;
        if (remainingMinutes <= 0) {
          throw new TRPCError({ code: "FORBIDDEN", message: "No access time remaining" });
        }

        // Consultar CPF completo (todos os módulos)
        const result = await consultarCPFCompleto(input.cpf);

        // Registrar consulta
        await db.createQueryRecord({
          userId: user.id,
          queryType: "cpf_completo",
          queryValue: input.cpf,
          result,
          status: result.success ? "success" : "error",
          minutesUsed: 5, // Consulta completa usa 5 minutos
        });

        // Atualizar minutos usados
        await db.updateUser(user.id, {
          usedMinutes: user.usedMinutes + 5,
        });

        await logActivity({
          userId: user.id,
          action: "query_cpf_completo",
          details: { cpf: input.cpf, success: result.success, modulosComDados: Object.keys(result.data).length },
        });

        return result;
      }),

    fotosCompleto: protectedProcedure
      .input(z.object({
        cpf: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = ctx.user;
        if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });

        if (user.isBlocked) {
          throw new TRPCError({ code: "FORBIDDEN", message: "User account is blocked" });
        }

        if (user.expiresAt && new Date() > user.expiresAt) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access has expired" });
        }

        const remainingMinutes = user.accessMinutes - user.usedMinutes;
        if (remainingMinutes <= 0) {
          throw new TRPCError({ code: "FORBIDDEN", message: "No access time remaining" });
        }

        // Consultar fotos completo (todos os estados)
        const result = await consultarFotosCPF(input.cpf);

        // Registrar consulta
        await db.createQueryRecord({
          userId: user.id,
          queryType: "fotos_completo",
          queryValue: input.cpf,
          result,
          status: result.success ? "success" : "error",
          minutesUsed: 3, // Consulta de fotos usa 3 minutos
        });

        // Atualizar minutos usados
        await db.updateUser(user.id, {
          usedMinutes: user.usedMinutes + 3,
        });

        await logActivity({
          userId: user.id,
          action: "query_fotos_completo",
          details: { cpf: input.cpf, success: result.success, fotosComDados: Object.keys(result.data).length },
        });

        return result;
      }),

    search: protectedProcedure
      .input(z.object({
        type: z.string(),
        value: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = ctx.user;
        if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });

        if (user.isBlocked) {
          throw new TRPCError({ code: "FORBIDDEN", message: "User account is blocked" });
        }

        // Check if access expired
        if (user.expiresAt && new Date() > user.expiresAt) {
          await db.createQueryRecord({
            userId: user.id,
            queryType: input.type,
            queryValue: input.value,
            status: "expired",
            minutesUsed: 0,
          });
          throw new TRPCError({ code: "FORBIDDEN", message: "Access has expired" });
        }

        // Check remaining time
        const remainingMinutes = user.accessMinutes - user.usedMinutes;
        if (remainingMinutes <= 0) {
          await db.createQueryRecord({
            userId: user.id,
            queryType: input.type,
            queryValue: input.value,
            status: "blocked",
            minutesUsed: 0,
          });
          throw new TRPCError({ code: "FORBIDDEN", message: "No access time remaining" });
        }

        // Determine endpoint (dados or fotos)
        const endpoint = getEndpointForParam(input.type);

        // Call iseek.pro API
        const apiResult = await queryISeek(endpoint, input.type, input.value);
        
        if (!apiResult.success) {
          await db.createQueryRecord({
            userId: user.id,
            queryType: input.type,
            queryValue: input.value,
            status: "error",
            errorMessage: apiResult.error,
            minutesUsed: 0,
          });
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: apiResult.error });
        }

        const result = {
          type: input.type,
          value: input.value,
          data: apiResult.data,
          timestamp: new Date(),
        };

        // Record query
        await db.createQueryRecord({
          userId: user.id,
          queryType: input.type,
          queryValue: input.value,
          result,
          status: "success",
          minutesUsed: 1,
        });

        // Update user used minutes
        await db.updateUser(user.id, {
          usedMinutes: user.usedMinutes + 1,
        });

        return result;
      }),

    history: protectedProcedure
      .input(z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
      }))
      .query(async ({ input, ctx }) => {
        const user = ctx.user;
        if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });

        const records = await db.getUserQueryHistory(user.id, input.limit, input.offset);
        const total = await db.getQueryHistoryCount(user.id);

        return { records, total };
      }),
  }),

  admin: router({
    stats: adminProcedure.query(async () => {
      const allUsers = await db.getAllUsers();
      const totalQueries = 0; // TODO: Count from queryHistory
      const activeUsers = allUsers.filter(u => !u.isBlocked).length;
      
      return {
        totalUsers: allUsers.length,
        activeUsers,
        totalQueries,
        blockedUsers: allUsers.filter(u => u.isBlocked).length,
      };
    }),

    users: router({
      list: adminProcedure.query(async () => {
        return db.getAllUsers();
      }),

      create: adminProcedure
        .input(z.object({
          email: z.string().email(),
          password: z.string().min(6),
          name: z.string(),
          accessMinutes: z.number(),
          expiresAt: z.date().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
          const hashedPassword = await bcrypt.hash(input.password, 10);
          await db.createUser({
            email: input.email,
            password: hashedPassword,
            name: input.name,
            accessMinutes: input.accessMinutes,
            expiresAt: input.expiresAt,
          });

          await logActivity({
            userId: ctx.user?.id,
            action: "admin_create_user",
            details: { email: input.email },
          });

          return { success: true };
        }),

      update: adminProcedure
        .input(z.object({
          userId: z.number(),
          updates: z.object({
            name: z.string().optional(),
            accessMinutes: z.number().optional(),
            expiresAt: z.date().optional(),
            isBlocked: z.boolean().optional(),
          }),
        }))
        .mutation(async ({ input, ctx }) => {
          await db.updateUser(input.userId, input.updates);
          await logActivity({
            userId: ctx.user?.id,
            action: "admin_update_user",
            details: { targetUserId: input.userId, updates: input.updates },
          });
          return { success: true };
        }),

      addTime: adminProcedure
        .input(z.object({
          userId: z.number(),
          minutes: z.number().positive(),
          reason: z.string().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
          const user = await db.getUserById(input.userId);
          if (!user) throw new TRPCError({ code: "NOT_FOUND" });

          await db.updateUser(input.userId, {
            accessMinutes: user.accessMinutes + input.minutes,
          });

          await db.addAccessTimeAdjustment({
            userId: input.userId,
            adminId: ctx.user!.id,
            minutesAdded: input.minutes,
            reason: input.reason,
          });

          await logActivity({
            userId: ctx.user?.id,
            action: "admin_add_time",
            details: { targetUserId: input.userId, minutes: input.minutes },
          });

          return { success: true };
        }),

      removeTime: adminProcedure
        .input(z.object({
          userId: z.number(),
          minutes: z.number().positive(),
          reason: z.string().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
          const user = await db.getUserById(input.userId);
          if (!user) throw new TRPCError({ code: "NOT_FOUND" });

          await db.updateUser(input.userId, {
            accessMinutes: Math.max(0, user.accessMinutes - input.minutes),
          });

          await db.addAccessTimeAdjustment({
            userId: input.userId,
            adminId: ctx.user!.id,
            minutesAdded: -input.minutes,
            reason: input.reason,
          });

          return { success: true };
        }),

      block: adminProcedure
        .input(z.object({
          userId: z.number(),
          blocked: z.boolean(),
        }))
        .mutation(async ({ input, ctx }) => {
          await db.updateUser(input.userId, { isBlocked: input.blocked });
          await logActivity({
            userId: ctx.user?.id,
            action: input.blocked ? "admin_block_user" : "admin_unblock_user",
            details: { targetUserId: input.userId },
          });
          return { success: true };
        }),

      delete: adminProcedure
        .input(z.object({ userId: z.number() }))
        .mutation(async ({ input, ctx }) => {
          // Soft delete by blocking
          await db.updateUser(input.userId, { isBlocked: true });
          await logActivity({
            userId: ctx.user?.id,
            action: "admin_delete_user",
            details: { targetUserId: input.userId },
          });
          return { success: true };
        }),
    }),

    logs: adminProcedure
      .input(z.object({
        limit: z.number().default(100),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        return db.getActivityLogs(input.limit, input.offset);
      }),
  }),
});

export type AppRouter = typeof appRouter;
