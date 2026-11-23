-- รวม Role DONOR และ RECIPIENT เป็น USER (ADMIN คงเดิม)
-- เขียนเอง เพราะ SQL ที่ Prisma สร้างจะล้มเมื่อยังมีแถวที่ใช้ค่าเดิม

-- 1. สร้าง enum ใหม่
CREATE TYPE "Role_new" AS ENUM ('USER', 'ADMIN');

-- 2. ถอด default เดิมที่ผูกกับ enum เก่า
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;

-- 3. แปลงข้อมูล: ADMIN คงเดิม ที่เหลือเป็น USER
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new"
  USING (CASE WHEN "role" = 'ADMIN' THEN 'ADMIN' ELSE 'USER' END)::"Role_new";

-- 4. ลบ enum เก่า แล้วเปลี่ยนชื่อ enum ใหม่เป็น Role
DROP TYPE "Role";
ALTER TYPE "Role_new" RENAME TO "Role";

-- 5. ตั้ง default ใหม่
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';
