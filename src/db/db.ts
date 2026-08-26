import Dexie, { Table } from 'dexie';
import { AppBackup, CompanyDetails, Customer, Quotation, TemplateConfig } from '../types';
import { DEFAULT_COMPANY_DETAILS, DEFAULT_TEMPLATE_CONFIG, SAMPLE_CUSTOMERS, SAMPLE_QUOTATIONS } from './defaultData';

export class ApexDatabase extends Dexie {
  quotations!: Table<Quotation, number>;
  customers!: Table<Customer, number>;
  companyDetails!: Table<CompanyDetails & { id: string }, string>;
  templateConfigs!: Table<TemplateConfig, number>;

  constructor() {
    super('ApexQuotationDB');
    this.version(1).stores({
      quotations: '++id, quotationNo, quotationDate, customerName, status, createdAt',
      customers: '++id, name, phone, email, createdAt',
      companyDetails: 'id',
      templateConfigs: '++id, name',
    });
  }
}

export const db = new ApexDatabase();

// Seed initial database state if first time
export async function initializeDatabase(): Promise<void> {
  try {
    await db.open();
    
    const companyCount = await db.companyDetails.count();
    if (companyCount === 0) {
      await db.companyDetails.put({
        id: 'default',
        ...DEFAULT_COMPANY_DETAILS,
      });
    }

    const templateCount = await db.templateConfigs.count();
    if (templateCount === 0) {
      await db.templateConfigs.add(DEFAULT_TEMPLATE_CONFIG);
    }

    const customerCount = await db.customers.count();
    if (customerCount === 0) {
      await db.customers.bulkAdd(SAMPLE_CUSTOMERS);
    }

    const quoteCount = await db.quotations.count();
    if (quoteCount === 0) {
      await db.quotations.bulkAdd(SAMPLE_QUOTATIONS);
    }
  } catch (err) {
    console.error('IndexedDB initialization error:', err);
  }
}

// Company Details helpers
export async function getCompanyDetails(): Promise<CompanyDetails> {
  try {
    const record = await db.companyDetails.get('default');
    if (record) {
      const { id, ...details } = record;
      return details;
    }
  } catch (err) {
    console.error('Error fetching company details:', err);
  }
  return DEFAULT_COMPANY_DETAILS;
}

export async function saveCompanyDetails(details: CompanyDetails): Promise<void> {
  try {
    await db.companyDetails.put({
      id: 'default',
      ...details,
    });
  } catch (err) {
    console.error('Error saving company details:', err);
  }
}

// Next Quotation Number auto-suggestion
export async function getNextSuggestedQuotationNo(): Promise<string> {
  try {
    const company = await getCompanyDetails();
    const prefix = company.quotePrefix || 'Q-';
    const nextNum = company.nextQuoteNumber || 101;
    return `${prefix}${nextNum}`;
  } catch {
    return 'Q-101';
  }
}

export async function incrementQuotationCounter(): Promise<void> {
  try {
    const company = await getCompanyDetails();
    company.nextQuoteNumber = (company.nextQuoteNumber || 100) + 1;
    await saveCompanyDetails(company);
  } catch (err) {
    console.error('Error incrementing counter:', err);
  }
}

// Template Config helpers
export async function getActiveTemplateConfig(): Promise<TemplateConfig> {
  try {
    const all = await db.templateConfigs.toArray();
    if (all && all.length > 0) {
      const def = all.find((t) => t.isDefault);
      if (def) return def;
      return all[0];
    }
  } catch (err) {
    console.error('Error loading template config:', err);
  }
  return DEFAULT_TEMPLATE_CONFIG;
}

export async function saveActiveTemplateConfig(config: TemplateConfig): Promise<void> {
  try {
    const all = await db.templateConfigs.toArray();
    const existing = all.find((t) => t.isDefault) || all[0];
    if (existing && existing.id) {
      await db.templateConfigs.update(existing.id, {
        ...config,
        updatedAt: Date.now(),
      });
    } else {
      await db.templateConfigs.add({
        ...config,
        isDefault: true,
        updatedAt: Date.now(),
      });
    }
  } catch (err) {
    console.error('Error saving template config:', err);
  }
}

export async function resetTemplateToDefault(): Promise<TemplateConfig> {
  try {
    const all = await db.templateConfigs.toArray();
    const existing = all.find((t) => t.isDefault) || all[0];
    if (existing && existing.id) {
      await db.templateConfigs.update(existing.id, {
        ...DEFAULT_TEMPLATE_CONFIG,
        updatedAt: Date.now(),
      });
    } else {
      await db.templateConfigs.add(DEFAULT_TEMPLATE_CONFIG);
    }
  } catch (err) {
    console.error('Error resetting template:', err);
  }
  return DEFAULT_TEMPLATE_CONFIG;
}

// Full Backup & Restore (JSON)
export async function exportFullBackup(): Promise<AppBackup> {
  const quotations = await db.quotations.toArray();
  const customers = await db.customers.toArray();
  const companyDetails = await getCompanyDetails();
  const templateConfig = await getActiveTemplateConfig();

  return {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    quotations,
    customers,
    companyDetails,
    templateConfig,
  };
}

export async function importFullBackup(backupData: AppBackup): Promise<boolean> {
  try {
    if (!backupData || !Array.isArray(backupData.quotations)) {
      throw new Error('Invalid backup file structure.');
    }

    await db.transaction('rw', [db.quotations, db.customers, db.companyDetails, db.templateConfigs], async () => {
      // Clear existing tables
      await db.quotations.clear();
      await db.customers.clear();
      await db.companyDetails.clear();
      await db.templateConfigs.clear();

      // Restore data
      if (backupData.quotations.length > 0) {
        await db.quotations.bulkAdd(backupData.quotations);
      }
      if (backupData.customers && backupData.customers.length > 0) {
        await db.customers.bulkAdd(backupData.customers);
      }
      if (backupData.companyDetails) {
        await db.companyDetails.put({
          id: 'default',
          ...backupData.companyDetails,
        });
      }
      if (backupData.templateConfig) {
        await db.templateConfigs.add({
          ...backupData.templateConfig,
          isDefault: true,
        });
      }
    });

    return true;
  } catch (err) {
    console.error('Failed to restore backup:', err);
    return false;
  }
}
