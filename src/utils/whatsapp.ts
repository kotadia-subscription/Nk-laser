import { MaterialType, ServiceCategory } from '../types';

/**
 * Builds a direct WhatsApp inquiry URL with formatted text pre-filled
 */
export function buildWhatsAppLink(
  phoneNumber: string,
  messageText: string
): string {
  // Clean phone number (strip spaces, dashes, plus sign)
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
  const encodedText = encodeURIComponent(messageText);
  return `https://wa.me/${cleanNumber}?text=${encodedText}`;
}

/**
 * Creates formatted WhatsApp message text for a specific product or service
 */
export function createProductInquiryMessage(
  itemTitle: string,
  category: ServiceCategory | string,
  material?: MaterialType | string,
  thickness?: string,
  customNote?: string
): string {
  let msg = `*Hello NK Laser Cutting!* 👋\n\nI am inquiring from your website regarding:\n📍 *Item/Service:* ${itemTitle}\n📁 *Category:* ${category}`;
  
  if (material) {
    msg += `\n🔩 *Material:* ${material}`;
  }
  if (thickness) {
    msg += `\n📏 *Thickness/Specs:* ${thickness}`;
  }
  if (customNote && customNote.trim()) {
    msg += `\n💬 *My Notes/Requirements:* ${customNote.trim()}`;
  }
  
  msg += `\n\nPlease let me know the availability, lead time, and quotation details. Thanks!`;
  return msg;
}

/**
 * Creates formatted WhatsApp message text from the Dynamic Quote Request Tool
 */
export function createQuoteCalculatorWhatsAppMessage(data: {
  serviceType: string;
  material: string;
  thicknessMm: number;
  quantity: number;
  lengthMm: number;
  widthMm: number;
  bendingOperations: number;
  weldingRequired: boolean;
  powderCoating: boolean;
  expressDelivery: boolean;
  customerName: string;
  notes?: string;
  estimatedCostRange?: string;
  fileName?: string;
}): string {
  let msg = `*NEW QUOTE REQUEST - NK LASER CUTTING* ⚡\n`;
  msg += `------------------------------------\n`;
  if (data.customerName) {
    msg += `👤 *Client Name:* ${data.customerName}\n`;
  }
  msg += `⚙️ *Service:* ${data.serviceType}\n`;
  msg += `🧱 *Material:* ${data.material}\n`;
  msg += `📏 *Thickness:* ${data.thicknessMm} mm\n`;
  msg += `📐 *Dimensions:* ${data.lengthMm} mm x ${data.widthMm} mm\n`;
  msg += `🔢 *Quantity:* ${data.quantity} pcs\n`;
  
  const addOns: string[] = [];
  if (data.bendingOperations > 0) addOns.push(`CNC Bending (${data.bendingOperations} bends)`);
  if (data.weldingRequired) addOns.push('Laser Welding');
  if (data.powderCoating) addOns.push('Powder Coating');
  if (data.expressDelivery) addOns.push('Express Priority');

  if (addOns.length > 0) {
    msg += `➕ *Value Added Services:* ${addOns.join(', ')}\n`;
  }

  if (data.fileName) {
    msg += `📄 *Attached Drawing:* ${data.fileName}\n`;
  }

  if (data.estimatedCostRange) {
    msg += `💰 *Est. Specs Reference:* ${data.estimatedCostRange}\n`;
  }

  if (data.notes && data.notes.trim()) {
    msg += `💬 *Project Notes:* ${data.notes.trim()}\n`;
  }

  msg += `------------------------------------\n`;
  msg += `Please reply with lead time & formal quotation. Thank you!`;
  return msg;
}
