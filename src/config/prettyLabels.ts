// src/config/prettyLabels.ts
type Pretty = { label: string; help?: string };

export const PRETTY_LABELS: Record<string, Pretty> = {
  clipart_title: { label: "Clipart Set Name", help: "*Used for filenames and headings.*" },
  clipart_number: { label: "Number Of Images", help: "*Enter a number only.*" },

  INCLUDED_HEADING: { label: "What’s Included – Heading" },
  INCLUDED_DETAILS: { label: "What’s Included – Details" },

  QUALITY_HEADING_1: { label: "Quality – Heading (1)" },
  QUALITY_DETAILS_1: { label: "Quality – Details (1)" },

  QUALITY_HEADING_2: { label: "Quality – Heading (2)" },
  QUALITY_DETAILS:   { label: "Quality – Details (2)" },

  TRANSPARENT_HEADING: { label: "Transparency – Heading" },
  TRANSPARENT_DETAILS: { label: "Transparency – Details" },

  PROGRAMS_HEADING: { label: "Programs – Heading" },
  PROGRAM_DETAILS: { label: "Programs – Details" },

  COORDINATED_HEADING: { label: "Coordinated Sets – Heading" },
  COORDINATED_DETAILS: { label: "Coordinated Sets – Details" },

  LICENSE_HEADING: { label: "License – Heading" },
  LICENSE_DETAILS: { label: "License – Details" },
  LICENSE_DO: { label: "License – Allowed (Do)" },
  LICENSE_DONT: { label: "License – Not Allowed (Don’t)" },

  CONSISTENCY_HEADING: { label: "Consistent Characters – Heading" },
  CONSISTENCY_DETAILS: { label: "Consistent Characters – Details" },

  TAGLINE: { label: "Tagline" },

  DISCOUNT_HEADING: { label: "Discount – Heading" },
  DISCOUNT_DETAILS: { label: "Discount – Details" },
  SHOP_LINK: { label: "Shop Link" },

  FREE_GIFT_HEADING: { label: "Free Gift – Heading" },
  FREE_GIFT_SUBHEADING: { label: "Free Gift – Subheading" },
  FREE_GIFT_NAME: { label: "Free Gift – Name" },

  REVIEWS_HEADING: { label: "Customer Reviews – Heading" },
  Review_1: { label: "Review 1" },
  Review_2: { label: "Review 2" },
  Review_3: { label: "Review 3" },

  INSPIRATION_HEADING: { label: "Inspiration – Heading" },
  INSPIRATION_DETAILS: { label: "Inspiration – Details" },

  FINAL_CTA_HEADING: { label: "Final Call-To-Action – Heading" },
  FINAL_CTA_DETAILS: { label: "Final Call-To-Action – Details" },
  FINAL_CTA_FOOTER: { label: "Final Call-To-Action – Footer" },
};
