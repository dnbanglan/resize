export interface FontOption {
  id: string;
  name: string;
  family: string;
  category: 'bengali' | 'english' | 'decorative';
  previewText: string;
}

export const AVAILABLE_FONTS: FontOption[] = [
  // Bengali Fonts
  {
    id: 'hind-siliguri',
    name: 'হিন্দ শিলিগুড়ি (Hind Siliguri)',
    family: "'Hind Siliguri', sans-serif",
    category: 'bengali',
    previewText: 'আমার সোনার বাংলা',
  },
  {
    id: 'noto-sans-bengali',
    name: 'নোটো সান্স বেঙ্গলি (Noto Sans Bengali)',
    family: "'Noto Sans Bengali', sans-serif",
    category: 'bengali',
    previewText: 'শুভ সকাল বাংলাদেশ',
  },
  {
    id: 'anek-bangla',
    name: 'অনেক বাংলা (Anek Bangla)',
    family: "'Anek Bangla', sans-serif",
    category: 'bengali',
    previewText: 'আজকের তাজা সংবাদ',
  },
  {
    id: 'tiro-bangla',
    name: 'তিরো বাংলা (Tiro Bangla Serif)',
    family: "'Tiro Bangla', serif",
    category: 'bengali',
    previewText: 'সাহিত্যের চিরন্তন রূপ',
  },
  // English / Universal Fonts
  {
    id: 'inter',
    name: 'Inter',
    family: "'Inter', sans-serif",
    category: 'english',
    previewText: 'Modern & Clean Sans',
  },
  {
    id: 'roboto',
    name: 'Roboto',
    family: "'Roboto', sans-serif",
    category: 'english',
    previewText: 'Standard Digital Type',
  },
  {
    id: 'playfair',
    name: 'Playfair Display',
    family: "'Playfair Display', serif",
    category: 'english',
    previewText: 'Editorial Elegance',
  },
  {
    id: 'impact',
    name: 'Impact / Headline',
    family: "Impact, sans-serif",
    category: 'decorative',
    previewText: 'BOLD HEADLINES',
  },
  {
    id: 'monospace',
    name: 'Monospace / Code',
    family: "ui-monospace, monospace",
    category: 'decorative',
    previewText: 'const creative = true;',
  },
];
