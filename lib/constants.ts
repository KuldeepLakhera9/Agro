export const SITE = {
  ownerName: "Amol Sanjay Jadhav",
  ownerPhone: "+919766033393",
  ownerPhoneDisplay: "+91 97660 33393",
  companyPhone: "+919665653393",
  companyPhoneDisplay: "+91 96656 53393",
  addressLine: "Rashin, Tal. Karjat, Dist. Ahilyanagar, Maharashtra, India",
};

export function whatsappLink(phone: string, text?: string) {
  const digits = phone.replace(/[^\d]/g, "");
  const base = `https://wa.me/${digits}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function telLink(phone: string) {
  return `tel:${phone}`;
}
