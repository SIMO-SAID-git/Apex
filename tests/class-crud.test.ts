import { describe, it, expect } from "vitest";
import { MockClassRepository, ClassError } from "@/lib/services/booking-service";

const baseInput = {
  title: "Sunrise Strength",
  description: "A strength session to start the day.",
  category: "strength" as const,
  intensity: "medium" as const,
  date: "2099-01-01",
  startTime: "06:00",
  durationMinutes: 45,
  capacity: 10,
  zoneId: "zone-iron",
};

describe("MockClassRepository CRUD", () => {
  it("creates a class as an unpublished draft owned by the trainer", async () => {
    const repo = new MockClassRepository();
    const created = await repo.createClass("trainer-1", baseInput);
    expect(created.isPublished).toBe(false);
    expect(created.instructorId).toBe("trainer-1");
    expect(created.endTime).toBe("06:45");
  });

  it("excludes unpublished drafts from the default (public) class list", async () => {
    const repo = new MockClassRepository();
    const created = await repo.createClass("trainer-2", { ...baseInput, date: "2099-02-02" });
    const publicList = await repo.getClasses({ date: "2099-02-02" });
    expect(publicList.find((c) => c.id === created.id)).toBeUndefined();

    const ownList = await repo.getClasses({ date: "2099-02-02", includeUnpublished: true });
    expect(ownList.find((c) => c.id === created.id)).toBeDefined();
  });

  it("appears in the public list once published", async () => {
    const repo = new MockClassRepository();
    const created = await repo.createClass("trainer-3", { ...baseInput, date: "2099-03-03" });
    await repo.publishClass(created.id, "trainer-3");
    const publicList = await repo.getClasses({ date: "2099-03-03" });
    expect(publicList.find((c) => c.id === created.id)?.isPublished).toBe(true);
  });

  it("prevents a different trainer from editing, publishing, or cancelling someone else's class", async () => {
    const repo = new MockClassRepository();
    const created = await repo.createClass("owner-trainer", { ...baseInput, date: "2099-04-04" });

    await expect(repo.updateClass(created.id, "other-trainer", { title: "Hijacked" })).rejects.toBeInstanceOf(ClassError);
    await expect(repo.publishClass(created.id, "other-trainer")).rejects.toBeInstanceOf(ClassError);
    await expect(repo.cancelClass(created.id, "other-trainer")).rejects.toBeInstanceOf(ClassError);
  });

  it("lets the owning trainer update and then cancel their own class", async () => {
    const repo = new MockClassRepository();
    const created = await repo.createClass("owner-trainer-2", { ...baseInput, date: "2099-05-05" });

    const updated = await repo.updateClass(created.id, "owner-trainer-2", { capacity: 20 });
    expect(updated.capacity).toBe(20);

    await repo.cancelClass(created.id, "owner-trainer-2");
    const found = await repo.getClassById(created.id);
    expect(found).toBeUndefined();
  });
});
