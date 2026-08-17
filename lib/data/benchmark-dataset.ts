export interface RegionalBenchmarkStats {
  region: string
  sampleSize: number
  avgTotalBudgetJuta: number
  categoryAveragesJuta: {
    Infrastruktur: number
    'Operasional Pemerintah Desa': number
    'Pemberdayaan Masyarakat': number
    Kesehatan: number
    Pendidikan: number
    Lainnya: number
  }
  categoryPercentages: {
    Infrastruktur: number
    'Operasional Pemerintah Desa': number
    'Pemberdayaan Masyarakat': number
    Kesehatan: number
    Pendidikan: number
    Lainnya: number
  }
  peersInfrastrukturJuta: number[]
}

export const REGIONAL_BENCHMARKS: Record<string, RegionalBenchmarkStats> = {
  'Semua Provinsi': {
    region: 'Nasional (Rata-rata 75.261 Desa)',
    sampleSize: 75261,
    avgTotalBudgetJuta: 1650,
    categoryAveragesJuta: {
      Infrastruktur: 680,
      'Operasional Pemerintah Desa': 520,
      'Pemberdayaan Masyarakat': 220,
      Kesehatan: 110,
      Pendidikan: 75,
      Lainnya: 45,
    },
    categoryPercentages: {
      Infrastruktur: 41.2,
      'Operasional Pemerintah Desa': 31.5,
      'Pemberdayaan Masyarakat': 13.3,
      Kesehatan: 6.7,
      Pendidikan: 4.5,
      Lainnya: 2.8,
    },
    peersInfrastrukturJuta: [580, 620, 650, 680, 690, 710, 730, 750, 780, 810],
  },
  'Jawa Tengah': {
    region: 'Provinsi Jawa Tengah (Kab. Karanganyar & Sekitarnya)',
    sampleSize: 7809,
    avgTotalBudgetJuta: 1950,
    categoryAveragesJuta: {
      Infrastruktur: 750,
      'Operasional Pemerintah Desa': 780,
      'Pemberdayaan Masyarakat': 230,
      Kesehatan: 110,
      Pendidikan: 70,
      Lainnya: 40,
    },
    categoryPercentages: {
      Infrastruktur: 38.5,
      'Operasional Pemerintah Desa': 40.0,
      'Pemberdayaan Masyarakat': 11.8,
      Kesehatan: 5.6,
      Pendidikan: 3.6,
      Lainnya: 2.1,
    },
    peersInfrastrukturJuta: [680, 710, 730, 740, 750, 760, 780, 790, 820, 850],
  },
  'Jawa Timur': {
    region: 'Provinsi Jawa Timur (Kab. Bojonegoro & Sekitarnya)',
    sampleSize: 7724,
    avgTotalBudgetJuta: 1720,
    categoryAveragesJuta: {
      Infrastruktur: 710,
      'Operasional Pemerintah Desa': 540,
      'Pemberdayaan Masyarakat': 240,
      Kesehatan: 120,
      Pendidikan: 65,
      Lainnya: 45,
    },
    categoryPercentages: {
      Infrastruktur: 41.3,
      'Operasional Pemerintah Desa': 31.4,
      'Pemberdayaan Masyarakat': 14.0,
      Kesehatan: 7.0,
      Pendidikan: 3.8,
      Lainnya: 2.6,
    },
    peersInfrastrukturJuta: [640, 670, 690, 705, 715, 730, 745, 760, 790, 820],
  },
  Bali: {
    region: 'Provinsi Bali (Kab. Tabanan & Sekitarnya)',
    sampleSize: 636,
    avgTotalBudgetJuta: 1480,
    categoryAveragesJuta: {
      Infrastruktur: 520,
      'Operasional Pemerintah Desa': 430,
      'Pemberdayaan Masyarakat': 250,
      Kesehatan: 140,
      Pendidikan: 80,
      Lainnya: 40,
    },
    categoryPercentages: {
      Infrastruktur: 35.1,
      'Operasional Pemerintah Desa': 29.1,
      'Pemberdayaan Masyarakat': 16.9,
      Kesehatan: 9.5,
      Pendidikan: 5.4,
      Lainnya: 2.7,
    },
    peersInfrastrukturJuta: [450, 480, 500, 515, 525, 540, 560, 580, 610, 640],
  },
  'Jawa Barat': {
    region: 'Provinsi Jawa Barat (Kab. Bekasi & Sekitarnya)',
    sampleSize: 5312,
    avgTotalBudgetJuta: 2100,
    categoryAveragesJuta: {
      Infrastruktur: 820,
      'Operasional Pemerintah Desa': 640,
      'Pemberdayaan Masyarakat': 300,
      Kesehatan: 170,
      Pendidikan: 90,
      Lainnya: 60,
    },
    categoryPercentages: {
      Infrastruktur: 39.0,
      'Operasional Pemerintah Desa': 30.5,
      'Pemberdayaan Masyarakat': 14.3,
      Kesehatan: 8.1,
      Pendidikan: 4.3,
      Lainnya: 2.9,
    },
    peersInfrastrukturJuta: [720, 760, 790, 810, 830, 850, 880, 910, 950, 990],
  },
}

export function getBenchmarkForRegion(regionName: string): RegionalBenchmarkStats {
  return REGIONAL_BENCHMARKS[regionName] || REGIONAL_BENCHMARKS['Semua Provinsi']
}
