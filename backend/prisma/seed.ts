import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

// seed รันผ่าน CLI จึงใช้ DIRECT_URL (session pooler 5432)
const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! });
const prisma = new PrismaClient({ adapter });

const CATEGORY_NAMES = [
  "เสื้อผ้า",
  "หนังสือ",
  "อุปกรณ์การเรียน",
  "เครื่องใช้ไฟฟ้า",
  "ของเล่น",
  "ของใช้ในบ้าน",
];

const ORG_NAMES = [
  "โรงเรียนบ้านหนองบัว",
  "มูลนิธิเด็กยิ้มสดใส",
  "ชุมชนคลองสามัคคี",
  "โรงเรียนวัดป่าไผ่",
  "มูลนิธิแบ่งปันน้ำใจ",
  "ชุมชนบ้านดอนแก้ว",
  "โรงเรียนตำรวจตระเวนชายแดนบ้านห้วยทราย",
  "มูลนิธิบ้านอุ่นรัก",
];

// [ชื่อ, คำอธิบาย, index ของหมวดใน CATEGORY_NAMES]
const ITEM_DATA: Array<[string, string, number]> = [
  ["เสื้อยืดเด็ก ไซซ์ S", "เสื้อยืดผ้าฝ้าย สีพื้น ซักสะอาดแล้ว", 0],
  ["หนังสือนิทานภาพสำหรับเด็ก", "นิทานภาพสองภาษา ไทย-อังกฤษ", 1],
  ["สมุดปกอ่อน 60 แผ่น", "สมุดเส้นบรรทัด ยังไม่ได้ใช้งาน", 2],
  ["พัดลมตั้งโต๊ะ 16 นิ้ว", "ใช้งานได้ปกติ ปรับได้ 3 ระดับ", 3],
  ["ตัวต่อเลโก้ชุดเล็ก", "ชิ้นส่วนครบ บรรจุในกล่อง", 4],
  ["ชุดจานชามเมลามีน", "จาน ชาม แก้ว อย่างละ 6 ชิ้น", 5],
  ["กางเกงนักเรียนขาสั้น", "สีกากี ไซซ์ 28-30", 0],
  ["หนังสือเรียนคณิตศาสตร์ ป.4", "หลักสูตรแกนกลาง มีรอยดินสอเล็กน้อย", 1],
  ["ดินสอไม้ 2B (แพ็ก 12 แท่ง)", "ของใหม่ ยังไม่แกะกล่อง", 2],
  ["หม้อหุงข้าว 1.8 ลิตร", "ใช้งานได้ดี มีถ้วยตวงครบ", 3],
  ["ตุ๊กตาหมีผ้า", "ซักทำความสะอาดแล้ว ขนาด 30 ซม.", 4],
  ["ผ้าห่มนวม 5 ฟุต", "ผ้าห่มหนานุ่ม เหมาะสำหรับหน้าหนาว", 5],
  ["เสื้อกันหนาวผู้ใหญ่", "ผ้าฟลีซ ไซซ์ L", 0],
  ["พจนานุกรมไทย-อังกฤษ", "ฉบับนักเรียน ปกแข็ง", 1],
  ["กระเป๋านักเรียน", "เป้สะพายหลัง มีช่องใส่ขวดน้ำ", 2],
  ["กาต้มน้ำไฟฟ้า", "ความจุ 1.7 ลิตร ตัดไฟอัตโนมัติ", 3],
  ["รถของเล่นบังคับวิทยุ", "ต้องใช้ถ่าน AA 4 ก้อน", 4],
  ["ชุดผ้าปูที่นอน 6 ฟุต", "พร้อมปลอกหมอน 2 ใบ", 5],
  ["ชุดนักเรียนหญิง", "เสื้อพร้อมกระโปรงสีกรมท่า", 0],
  ["หนังสือวรรณกรรมเยาวชน", "รวมเรื่องสั้นสำหรับเด็กประถม", 1],
  ["ไม้บรรทัดและชุดเรขาคณิต", "ครบชุด ไม้บรรทัด ฉาก วงเวียน", 2],
  ["หลอดไฟ LED 9 วัตต์", "ขั้ว E27 แสงขาว", 3],
  ["เกมบันไดงู", "บอร์ดเกมพร้อมลูกเต๋าและตัวเดิน", 4],
  ["ถังน้ำพลาสติกพร้อมฝา", "ขนาด 20 ลิตร", 5],
  ["รองเท้าผ้าใบนักเรียน", "สีขาว เบอร์ 36", 0],
  ["หนังสือภาษาอังกฤษเบื้องต้น", "แบบฝึกหัดสำหรับผู้เริ่มต้น", 1],
  ["สีเทียน 24 สี", "ของใหม่ บรรจุกล่อง", 2],
  ["วิทยุ AM/FM แบบพกพา", "ใช้ได้ทั้งถ่านและไฟบ้าน", 3],
  ["ลูกบอลฟุตบอล", "เบอร์ 4 สำหรับเด็ก", 4],
  ["ไม้กวาดและที่ตักผง", "ชุดทำความสะอาดพื้นบ้าน", 5],
  ["หมวกไหมพรมเด็ก", "ถักมือ อบอุ่นใส่สบาย", 0],
  ["หนังสือการ์ตูนความรู้วิทยาศาสตร์", "เล่มชุดเรื่องร่างกายมนุษย์", 1],
  ["เครื่องคิดเลขวิทยาศาสตร์", "ใช้งานได้ปกติ มีฝาครอบ", 2],
  ["โคมไฟอ่านหนังสือ", "ปรับระดับความสว่างได้", 3],
  ["จิ๊กซอว์ 500 ชิ้น", "ภาพแผนที่ประเทศไทย ชิ้นส่วนครบ", 4],
  ["กล่องพลาสติกเก็บของ", "ขนาดกลาง มีล้อเลื่อน", 5],
  ["ถุงเท้านักเรียน (แพ็ก 6 คู่)", "สีขาว ของใหม่", 0],
  ["นิตยสารสารคดีเก่า", "รวมเล่มย้อนหลัง สภาพตามอายุ", 1],
  ["ไมโครเวฟ 20 ลิตร", "ปุ่มหมุนชำรุดบางส่วน", 3],
  ["ปืนฉีดน้ำของเล่น", "พลาสติกมีรอยร้าว", 4],
];

const CONDITIONS = ["NEW", "GOOD", "USED"] as const;
const REQUEST_STATUSES = ["PENDING", "APPROVED", "REJECTED", "SHIPPED", "DELIVERED"] as const;

function itemStatus(index: number): "AVAILABLE" | "PENDING_REVIEW" | "REJECTED" {
  if (index < 34) return "AVAILABLE";
  if (index < 38) return "PENDING_REVIEW";
  return "REJECTED";
}

async function main(): Promise<void> {
  // ลบข้อมูลเก่า (ลูก → แม่) เพื่อให้รัน seed ซ้ำได้
  await prisma.request.deleteMany();
  await prisma.item.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  const categories = await prisma.category.createManyAndReturn({
    data: CATEGORY_NAMES.map((name) => ({ name })),
  });
  // createManyAndReturn ไม่รับประกันลำดับ จึงจับคู่ด้วยชื่อ
  const categoryIdByName = new Map(categories.map((c) => [c.name, c.id]));

  await prisma.user.create({
    data: { name: "ผู้ดูแลระบบ", email: "admin@sharebox.test", passwordHash, role: "ADMIN" as const },
  });

  const donors = await prisma.user.createManyAndReturn({
    data: Array.from({ length: 10 }, (_, i) => ({
      name: `ผู้บริจาค ${i + 1}`,
      email: `donor${i + 1}@sharebox.test`,
      passwordHash,
      role: "DONOR" as const,
      phone: `08${String(10000000 + i).padStart(8, "0")}`,
    })),
  });
  donors.sort((a, b) => a.id - b.id);

  const recipients = await prisma.user.createManyAndReturn({
    data: ORG_NAMES.map((orgName, i) => ({
      name: `ผู้ประสานงาน ${orgName}`,
      email: `org${i + 1}@sharebox.test`,
      passwordHash,
      role: "RECIPIENT" as const,
      orgName,
      phone: `09${String(20000000 + i).padStart(8, "0")}`,
    })),
  });
  recipients.sort((a, b) => a.id - b.id);

  const items = await prisma.item.createManyAndReturn({
    data: ITEM_DATA.map(([name, description, catIndex], i) => ({
      name,
      description,
      imageUrl: `https://picsum.photos/seed/sharebox-${i + 1}/600/400`,
      condition: CONDITIONS[i % CONDITIONS.length],
      quantity: ((i * 7) % 50) + 1, // 1–50
      status: itemStatus(i),
      categoryId: categoryIdByName.get(CATEGORY_NAMES[catIndex])!,
      donorId: donors[i % donors.length].id,
    })),
  });
  items.sort((a, b) => a.id - b.id);

  const requests = await prisma.request.createManyAndReturn({
    data: items.slice(0, 20).map((item, i) => ({
      quantity: 1,
      reason: `${recipients[i % recipients.length].orgName} ต้องการ${item.name}เพื่อนำไปใช้ประโยชน์`,
      status: REQUEST_STATUSES[i % REQUEST_STATUSES.length],
      itemId: item.id,
      recipientId: recipients[i % recipients.length].id,
    })),
  });

  const userCount = await prisma.user.count();
  console.log(
    `Seed เสร็จ: categories ${categories.length}, users ${userCount}, items ${items.length}, requests ${requests.length}`,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e: unknown) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
