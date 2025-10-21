// src/config/tokensByLayout.ts
// Exact Canva placeholder tokens for EACH of the 26 mockups.
// Verified against use.pdf + Lesley’s corrections.

export const TOKENS_BY_LAYOUT: Record<number, string[]> = {
  1: ["clipart_title", "clipart_number", "CLIPART_DETAILS"],
  2: ["clipart_title", "clipart_number", "CLIPART_DETAILS"],

  3: ["INCLUDED_HEADING", "INCLUDED_DETAILS"],
  4: ["INCLUDED_HEADING", "INCLUDED_DETAILS"],
  5: ["INCLUDED_DETAILS", "INCLUDED_HEADING"],
  6: ["INCLUDED_HEADING", "INCLUDED_DETAILS"],

  7: ["QUALITY_HEADING_1", "QUALITY_DETAILS_1"],
  8: ["TRANSPARENT_HEADING", "transparent_details"],
  9: ["QUALITY_HEADING_2", "QUALITY_DETAILS"],

  10: ["MOCKUP_1_A_HEADING", "MOCKUP_1_A_DETAILS"],
  11: ["MOCKUP_1_B_HEADING", "MOCKUP_1_B_DETAILS"],
  12: ["MOCKUP_2_A_HEADING", "MOCKUP_2_A_DETAILS"],
  13: ["MOCKUP_2_B_HEADING", "MOCKUP_2_B_DETAILS"],
  14: ["MOCKUP_3_a_HEADING", "MOCKUP_3_a_DETAILS"],
  15: ["MOCKUP_3_B_HEADING", "MOCKUP_3_B_DETAILS"],

  16: ["PROGRAMS_HEADING", "PROGRAM_DETAILS"],
  17: ["COORDINATED_HEADING", "COORDINATED_DETAILS"],
[18]: ["LICENSE_HEADING", "LICENSE_DETAILS", "license_do_list", "license_dont_list"],
  19: ["HOW_HEADING"],
  20: ["CONSISTENCY_HEADING", "CONSISTENCY_DETAILS"],
  21: ["TAGLINE"],

  22: ["DISCOUNT_HEADING", "DISCOUNT_DETAILS", "discount_badge", "SHOP_LINK"],
  23: ["FREE_GIFT_HEADING", "FREE_GIFT_SUBHEADING", "FREE_GIFT_NAME"],
  24: ["REVIEWS_HEADING", "Review_1", "Review_2", "Review_3"],
  25: ["INSPIRATION_HEADING", "INSPIRATION_DETAILS"],
  26: ["FINAL_CTA_HEADING", "FINAL_CTA_DETAILS", "FINAL_CTA_FOOTER"],
};
