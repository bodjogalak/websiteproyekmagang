import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { 
  Document, Packer, Paragraph, TextRun, AlignmentType, 
  Table, TableRow, TableCell, WidthType, BorderStyle 
} from "docx";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { applicationId } = await req.json();
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!app) return NextResponse.json({ error: "Data 404" }, { status: 404 });

    const today = new Date().toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
    });

    // HELPER: Bikin Baris Tabel Kosong (Border Hilang)
    const createNoBorderCell = (text: string, bold = false, width = 3000) => {
        return new TableCell({
            width: { size: width, type: WidthType.DXA },
            borders: {
                top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            },
            children: [new Paragraph({ children: [new TextRun({ text, bold })] })],
        });
    };

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // --- 1. KOP SURAT (Tetap Center) ---
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({ text: "PEMERINTAH PROVINSI SULAWESI UTARA", bold: true, size: 24 }),
                ],
            }),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({ text: "DINAS KOMUNIKASI, INFORMATIKA,", bold: true, size: 28 }),
                ],
            }),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({ text: "PERSANDIAN DAN STATISTIK DAERAH", bold: true, size: 28 }),
                ],
            }),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
                children: [
                    new TextRun({ text: "Jl. 17 Agustus No. 69, Manado", size: 18, italics: true }),
                ],
            }),
            // Garis Bawah Kop (Border Bottom Paragraph)
            new Paragraph({
                border: { bottom: { color: "000000", space: 1, style: "single", size: 6 } },
                text: "", 
                spacing: { after: 400 }
            }),

            // --- 2. TANGGAL & HEADER ---
            new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [ new TextRun({ text: `Manado, ${today}` }) ],
            }),
            
            // CHEAT CODE: Gunakan TABEL untuk "Nomor" dan "Perihal" biar lurus di Preview
            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                    top: { style: BorderStyle.NONE },
                    bottom: { style: BorderStyle.NONE },
                    left: { style: BorderStyle.NONE },
                    right: { style: BorderStyle.NONE },
                    insideHorizontal: { style: BorderStyle.NONE },
                    insideVertical: { style: BorderStyle.NONE },
                },
                rows: [
                    new TableRow({
                        children: [
                            createNoBorderCell("Nomor", false, 1500),
                            createNoBorderCell(":", false, 200),
                            createNoBorderCell("800/DKIPSD/...../2026", false, 6000),
                        ]
                    }),
                    new TableRow({
                        children: [
                            createNoBorderCell("Perihal", false, 1500),
                            createNoBorderCell(":", false, 200),
                            createNoBorderCell("Surat Balasan Permohonan Magang", false, 6000),
                        ]
                    }),
                ],
            }),

            new Paragraph({ text: "", spacing: { before: 200, after: 200 } }),

            new Paragraph({ text: "Kepada Yth," }),
            new Paragraph({
                children: [ new TextRun({ text: `Rektor / Dekan ${app.campus}`, bold: true }) ],
            }),
            new Paragraph({ text: "Di -" }),
            new Paragraph({ text: "    Tempat", spacing: { after: 300 } }),

            // --- 3. ISI SURAT ---
            new Paragraph({
                alignment: AlignmentType.JUSTIFIED,
                children: [
                    new TextRun("Menunjuk surat permohonan magang Saudara, dengan ini kami sampaikan bahwa Pemerintah Provinsi Sulawesi Utara melalui Dinas Komunikasi, Informatika, Persandian dan Statistik Daerah "),
                    new TextRun({ text: "MENERIMA", bold: true }),
                    new TextRun(" mahasiswa berikut untuk melaksanakan Praktik Kerja Lapangan (Magang):"),
                ],
                spacing: { after: 200 }
            }),

            // CHEAT CODE: Gunakan TABEL untuk BIODATA biar titik duanya lurus
            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE }, // Indent kiri dikit
                indent: { size: 500, type: WidthType.DXA },
                borders: {
                    top: { style: BorderStyle.NONE },
                    bottom: { style: BorderStyle.NONE },
                    left: { style: BorderStyle.NONE },
                    right: { style: BorderStyle.NONE },
                    insideHorizontal: { style: BorderStyle.NONE },
                    insideVertical: { style: BorderStyle.NONE },
                },
                rows: [
                    new TableRow({
                        children: [
                            createNoBorderCell("Nama", false, 1500),
                            createNoBorderCell(":", false, 200),
                            createNoBorderCell(app.fullName, true, 6000),
                        ]
                    }),
                    new TableRow({
                        children: [
                            createNoBorderCell("Jurusan", false, 1500),
                            createNoBorderCell(":", false, 200),
                            createNoBorderCell(app.major, false, 6000),
                        ]
                    }),
                    new TableRow({
                        children: [
                            createNoBorderCell("Semester", false, 1500),
                            createNoBorderCell(":", false, 200),
                            createNoBorderCell(app.semester, false, 6000),
                        ]
                    }),
                ],
            }),

            new Paragraph({ text: "", spacing: { before: 200 } }),

            new Paragraph({
                alignment: AlignmentType.JUSTIFIED,
                text: "Demikian surat balasan ini kami sampaikan untuk dapat dipergunakan sebagaimana mestinya. Atas perhatian dan kerjasamanya diucapkan terima kasih.",
                spacing: { after: 600 }
            }),

            // --- 4. TANDA TANGAN (Pakai Tabel biar posisinya pas di kanan) ---
            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                    top: { style: BorderStyle.NONE },
                    bottom: { style: BorderStyle.NONE },
                    left: { style: BorderStyle.NONE },
                    right: { style: BorderStyle.NONE },
                    insideHorizontal: { style: BorderStyle.NONE },
                    insideVertical: { style: BorderStyle.NONE },
                },
                rows: [
                    new TableRow({
                        children: [
                            createNoBorderCell("", false, 5000), // Kolom kiri kosong (spacer)
                            new TableCell({
                                width: { size: 4000, type: WidthType.DXA },
                                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                                children: [
                                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Kepala Dinas,", bold: true })] }),
                                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "(Tanda Tangan Digital)", italics: true, color: "888888" })] }),
                                    new Paragraph({ text: "", spacing: { after: 1200 } }), // Jarak TTD
                                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "NAMA KEPALA DINAS", bold: true, underline: { type: "single" } })] }),
                                    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "NIP. 19xxxxxxxxxxxxxx" })] }),
                                ]
                            })
                        ]
                    })
                ]
            }),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="Surat_Balasan_${app.fullName.replace(/\s+/g, '_')}.docx"`,
      },
    });

  } catch (error) {
    console.error("Generate Error:", error);
    return NextResponse.json({ error: "Gagal membuat surat" }, { status: 500 });
  }
}