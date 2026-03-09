import { describe, it, expect } from "vitest";
import { getModuleByKey, getAllModules } from "./iseek";

describe("iSeek Modules", () => {
  describe("getAllModules", () => {
    it("should return all module categories", () => {
      const modules = getAllModules();
      expect(modules).toBeDefined();
      expect(Object.keys(modules).length).toBeGreaterThan(0);
    });

    it("should have IDENTIFICACAO category", () => {
      const modules = getAllModules();
      expect(modules.IDENTIFICACAO).toBeDefined();
      expect(modules.IDENTIFICACAO.modules.length).toBeGreaterThan(0);
    });

    it("should have FOTOS_ESTADUAIS category", () => {
      const modules = getAllModules();
      expect(modules.FOTOS_ESTADUAIS).toBeDefined();
      expect(modules.FOTOS_ESTADUAIS.modules.length).toBeGreaterThan(0);
    });
  });

  describe("getModuleByKey", () => {
    it("should find CPF module", () => {
      const module = getModuleByKey("cpf");
      expect(module).toBeDefined();
      expect(module?.label).toBe("CPF");
      expect(module?.param).toBe("cpf");
    });

    it("should find CNPJ module", () => {
      const module = getModuleByKey("cnpj");
      expect(module).toBeDefined();
      expect(module?.label).toBe("CNPJ");
    });

    it("should find Foto SP module", () => {
      const module = getModuleByKey("fotosp");
      expect(module).toBeDefined();
      expect(module?.label).toBe("Foto - SP");
    });

    it("should return null for unknown module", () => {
      const module = getModuleByKey("unknown_module");
      expect(module).toBeNull();
    });

    it("should find CNH module", () => {
      const module = getModuleByKey("fotocnh");
      expect(module).toBeDefined();
      expect(module?.label).toBe("Foto CNH");
    });
  });

  describe("Module Structure", () => {
    it("should have correct module structure", () => {
      const modules = getAllModules();
      const firstCategory = Object.values(modules)[0];
      
      expect(firstCategory).toHaveProperty("label");
      expect(firstCategory).toHaveProperty("modules");
      expect(Array.isArray(firstCategory.modules)).toBe(true);
    });

    it("should have correct module item structure", () => {
      const modules = getAllModules();
      const firstModule = Object.values(modules)[0].modules[0];
      
      expect(firstModule).toHaveProperty("key");
      expect(firstModule).toHaveProperty("label");
      expect(firstModule).toHaveProperty("param");
      expect(firstModule).toHaveProperty("type");
    });

    it("should have at least 40+ dados modules", () => {
      const modules = getAllModules();
      let totalDadosModules = 0;
      
      const dadosCategories = [
        "IDENTIFICACAO",
        "PESSOAIS",
        "DOCUMENTOS",
        "PROFISSIONAL",
        "VEICULOS",
        "CNH",
        "FINANCEIRO",
        "JURIDICO",
        "EDUCACAO_SAUDE",
        "PATRIMONIO",
        "RELACIONAMENTOS",
      ];
      
      for (const category of dadosCategories) {
        if (modules[category as keyof typeof modules]) {
          totalDadosModules += modules[category as keyof typeof modules].modules.length;
        }
      }
      
      expect(totalDadosModules).toBeGreaterThanOrEqual(40);
    });

    it("should have at least 16+ fotos modules", () => {
      const modules = getAllModules();
      let totalFotosModules = 0;
      
      const fotosCategories = ["FOTOS_ESTADUAIS", "FOTOS_CNH_CRLV"];
      
      for (const category of fotosCategories) {
        if (modules[category as keyof typeof modules]) {
          totalFotosModules += modules[category as keyof typeof modules].modules.length;
        }
      }
      
      expect(totalFotosModules).toBeGreaterThanOrEqual(16);
    });
  });
});
