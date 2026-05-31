
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';

class PdfService {
  static Future<void> generateInvoice({
    required String amount,
    required String method,
    required String date,
    required String invoiceNumber,
  }) async {
    final pdf = pw.Document();

    final font = await PdfGoogleFonts.interRegular();
    final fontBold = await PdfGoogleFonts.interBold();

    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a4,
        build: (pw.Context context) {
          return pw.Container(
            padding: const pw.EdgeInsets.all(40),
            child: pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Text(
                      'NSI BILLING',
                      style: pw.TextStyle(
                        font: fontBold,
                        fontSize: 24,
                        color: PdfColors.blue700,
                      ),
                    ),
                    pw.Text(
                      'STRUK PEMBAYARAN',
                      style: pw.TextStyle(
                        font: fontBold,
                        fontSize: 14,
                        color: PdfColors.grey700,
                      ),
                    ),
                  ],
                ),
                pw.Divider(thickness: 2, color: PdfColors.blue700),
                pw.SizedBox(height: 30),
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.start,
                      children: [
                        pw.Text('Ditagihkan Kepada:', style: pw.TextStyle(font: fontBold)),
                        pw.Text('Pelanggan Setia NSI', style: pw.TextStyle(font: font)),
                      ],
                    ),
                    pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.end,
                      children: [
                        pw.Text('No. Invoice:', style: pw.TextStyle(font: fontBold)),
                        pw.Text(invoiceNumber, style: pw.TextStyle(font: font)),
                        pw.SizedBox(height: 10),
                        pw.Text('Tanggal:', style: pw.TextStyle(font: fontBold)),
                        pw.Text(date, style: pw.TextStyle(font: font)),
                      ],
                    ),
                  ],
                ),
                pw.SizedBox(height: 50),
                pw.Table(
                  border: pw.TableBorder.all(color: PdfColors.grey300),
                  children: [
                    pw.TableRow(
                      decoration: const pw.BoxDecoration(color: PdfColors.grey100),
                      children: [
                        pw.Padding(
                          padding: const pw.EdgeInsets.all(10),
                          child: pw.Text('Deskripsi', style: pw.TextStyle(font: fontBold)),
                        ),
                        pw.Padding(
                          padding: const pw.EdgeInsets.all(10),
                          child: pw.Text('Metode', style: pw.TextStyle(font: fontBold)),
                        ),
                        pw.Padding(
                          padding: const pw.EdgeInsets.all(10),
                          child: pw.Text('Total', style: pw.TextStyle(font: fontBold)),
                        ),
                      ],
                    ),
                    pw.TableRow(
                      children: [
                        pw.Padding(
                          padding: const pw.EdgeInsets.all(10),
                          child: pw.Text('Pembayaran Tagihan Internet', style: pw.TextStyle(font: font)),
                        ),
                        pw.Padding(
                          padding: const pw.EdgeInsets.all(10),
                          child: pw.Text(method, style: pw.TextStyle(font: font)),
                        ),
                        pw.Padding(
                          padding: const pw.EdgeInsets.all(10),
                          child: pw.Text(amount, style: pw.TextStyle(font: fontBold)),
                        ),
                      ],
                    ),
                  ],
                ),
                pw.SizedBox(height: 40),
                pw.Container(
                  alignment: pw.Alignment.centerRight,
                  child: pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.end,
                    children: [
                      pw.Text('Total Bayar:', style: pw.TextStyle(font: fontBold, fontSize: 16)),
                      pw.Text(amount, style: pw.TextStyle(font: fontBold, fontSize: 20, color: PdfColors.blue700)),
                      pw.SizedBox(height: 5),
                      pw.Text('Status: BERHASIL', style: pw.TextStyle(font: fontBold, color: PdfColors.green700)),
                    ],
                  ),
                ),
                pw.Spacer(),
                pw.Center(
                  child: pw.Text(
                    'Terima kasih telah menggunakan layanan NSI.',
                    style: pw.TextStyle(font: font, fontSize: 10, color: PdfColors.grey500),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );

    await Printing.layoutPdf(
      onLayout: (PdfPageFormat format) async => pdf.save(),
      name: 'Invoice-$invoiceNumber.pdf',
    );
  }
}
