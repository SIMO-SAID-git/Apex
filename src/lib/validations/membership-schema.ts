import { z } from "zod";

export const changeMembershipTierSchema = z.object({
  tier: z.enum(["free", "foundation", "performance", "elite"]),
});
