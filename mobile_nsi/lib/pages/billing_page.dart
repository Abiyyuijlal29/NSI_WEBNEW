import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../services/pdf_service.dart';
import '../widgets/loading_logo.dart';

class BillingPage extends StatefulWidget {
  final bool autoOpenPayment;
  const BillingPage({super.key, this.autoOpenPayment = false});

  @override
  State<BillingPage> createState() => _BillingPageState();
}

class _BillingPageState extends State<BillingPage> {
  final ScrollController _scrollController = ScrollController();
  final ImagePicker _picker = ImagePicker();
  List<dynamic> _billingHistory = [];
  bool _isLoading = true;
  int _currentBill = 0;
  bool _isPaid = false;
  String _dueDate = "15 Oktober 2026";

  @override
  void initState() {
    super.initState();
    _fetchBillingHistory();
    if (widget.autoOpenPayment) {
      _triggerAutoPayment();
    }
  }



  Future<void> _fetchBillingHistory() async {
    try {
      final user = Supabase.instance.client.auth.currentUser;
      if (user != null) {
        final data = await Supabase.instance.client
            .from('billing_customer')
            .select('*')
            .eq('id_user', user.id)
            .order('tanggal_pembayaran', ascending: false);

        // Ambil juga data tagihan saat ini dari profile
        final profile = await Supabase.instance.client
            .from('profile_customer')
            .select('tagihan_saat_ini, created_at')
            .eq('id', user.id)
            .maybeSingle();

        if (mounted) {
          setState(() {
            _billingHistory = (data as List<dynamic>?) ?? [];

            // Ambil total tagihan dari profile
            int totalTagihan = (profile?['tagihan_saat_ini'] ?? 0).toInt();
            int totalPaid = 0;
            final now = DateTime.now();

            // Hitung total pembayaran yang berhasil untuk bulan ini
            for (var item in _billingHistory) {
              if (item['status_pembayaran'] == 'Berhasil') {
                try {
                  final rawDate = item['tanggal_pembayaran'];
                  if (rawDate != null) {
                    DateTime payDate = DateTime.parse(rawDate.toString());
                    // Filter pembayaran hanya untuk bulan dan tahun yang sama
                    if (payDate.month == now.month && payDate.year == now.year) {
                      // Gunakan jumlah_tagihan atau jumlah_pembayaran sesuai skema DB
                      final amount = item['jumlah_tagihan'] ?? item['jumlah_pembayaran'] ?? 0;
                      totalPaid += (amount as num).toInt();
                    }
                  }
                } catch (e) {
                  debugPrint("Error parsing history item: $e");
                }
              }
            }

            // Hitung sisa tagihan
            _currentBill = totalTagihan - totalPaid;
            if (_currentBill < 0) _currentBill = 0;

            // Update status lunas
            _isPaid = _currentBill <= 0;
            // Hitung jatuh tempo: tanggal pembayaran terakhir yang berhasil + 1 bulan
            // Jika belum ada pembayaran, fallback ke created_at, lalu ke now()
            DateTime? lastSuccessfulPayDate;
            for (var item in _billingHistory) {
              if (item['status_pembayaran'] == 'Berhasil') {
                final rawDate = item['tanggal_pembayaran'];
                if (rawDate != null) {
                  try {
                    lastSuccessfulPayDate = DateTime.parse(rawDate.toString());
                    break; // sudah terurut descending, ambil yang pertama saja
                  } catch (_) {}
                }
              }
            }
            if (lastSuccessfulPayDate != null) {
              DateTime due = DateTime(lastSuccessfulPayDate.year, lastSuccessfulPayDate.month + 1, lastSuccessfulPayDate.day);
              _dueDate = _formatDueDate(due);
            } else if (profile?['created_at'] != null) {
              try {
                DateTime created = DateTime.parse(profile!['created_at'].toString());
                DateTime due = DateTime(created.year, created.month + 1, created.day);
                _dueDate = _formatDueDate(due);
              } catch (_) {
                _dueDate = _formatDueDate(DateTime.now().add(const Duration(days: 30)));
              }
            } else {
              // Fallback terakhir: sebulan dari sekarang
              _dueDate = _formatDueDate(DateTime.now().add(const Duration(days: 30)));
            }
            _isLoading = false;
          });
        }
      }
    } catch (e) {
      debugPrint("Error in _fetchBillingHistory: $e");
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  void didUpdateWidget(covariant BillingPage oldWidget) {
    super.didUpdateWidget(oldWidget);
    _fetchBillingHistory(); // Refresh data on tab switch
    if (widget.autoOpenPayment && !oldWidget.autoOpenPayment) {
      _triggerAutoPayment();
    }
  }

  void _triggerAutoPayment() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _showPaymentMethod(context);
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _pickImage(BuildContext context, String methodName) async {
    final XFile? image = await _picker.pickImage(source: ImageSource.gallery);
    if (image != null) {
      try {
        final user = Supabase.instance.client.auth.currentUser;
        if (user != null) {
          final invoiceNumber =
              "INV-${DateTime.now().year}${DateTime.now().month}${DateTime.now().day}-${DateTime.now().millisecond}";

          await Supabase.instance.client.from('billing_customer').insert({
            'id_user': user.id,
            'jumlah_tagihan': _currentBill,
            'metode_pembayaran': methodName,
            'nomor_invoice': invoiceNumber,
            'tanggal_pembayaran': DateTime.now().toIso8601String(),
            'status_pembayaran': 'Berhasil',
          });

          await Supabase.instance.client
              .from('profile_customer')
              .update({
                'is_tagihan_paid': true,
                'tagihan_saat_ini': 0,
              })
              .eq('id', user.id);

          if (context.mounted) {
            Navigator.pop(context); // Close upload dialog
            _showSuccessPayment(context);
            _fetchBillingHistory(); // Refresh history data
          }
        }
      } catch (e) {
        debugPrint("Payment Error: $e");
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text("Gagal menyimpan data: $e"),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    }
  }

  void _showSuccessPayment(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.check_circle, color: Colors.green, size: 60),
            const SizedBox(height: 20),
            Text(
              "Berhasil Diupload!",
              style: GoogleFonts.outfit(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 10),
            Text(
              "Bukti pembayaran Anda sedang diproses. Silakan tunggu konfirmasi.",
              textAlign: TextAlign.center,
              style: GoogleFonts.outfit(color: Colors.grey),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2962FF),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              child: const Text("OK", style: TextStyle(color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }

  void _showUploadProof(
    BuildContext context,
    String methodName,
    String accountInfo,
  ) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
        ),
        padding: const EdgeInsets.all(30),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  "Upload Bukti Transfer",
                  style: GoogleFonts.outfit(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.close,
                      size: 20,
                      color: Colors.grey,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 25),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFFF0F7FF),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Nomor Rekening Tujuan:",
                    style: GoogleFonts.outfit(
                      fontSize: 13,
                      color: Colors.blue.shade700,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    "$methodName: $accountInfo",
                    style: GoogleFonts.outfit(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    "a.n. PT Net Satu Internews",
                    style: GoogleFonts.outfit(
                      fontSize: 14,
                      color: Colors.grey.shade700,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 25),
            Text(
              "Total Transfer",
              style: GoogleFonts.outfit(
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 10),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.grey.shade50,
                borderRadius: BorderRadius.circular(15),
              ),
              child: Text(
                "Rp ${_formatNumber(_currentBill)}",
                style: GoogleFonts.outfit(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(height: 25),
            _InteractiveUploadCard(
              onTap: () => _pickImage(context, methodName),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const LoadingLogo();
    }
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FE),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "Pembayaran",
              style: GoogleFonts.outfit(
                fontWeight: FontWeight.bold,
                color: Colors.black,
                fontSize: 20,
              ),
            ),
            Text(
              "Kelola pembayaran tagihan Anda",
              style: GoogleFonts.outfit(
                color: Colors.grey,
                fontSize: 13,
                fontWeight: FontWeight.w400,
              ),
            ),
          ],
        ),
        centerTitle: false,
      ),
      body: Scrollbar(
        controller: _scrollController,
        thumbVisibility: true,
        thickness: 8,
        radius: const Radius.circular(10),
        child: SingleChildScrollView(
          controller: _scrollController,
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Blue Bill Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(25),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [Color(0xFF2962FF), Color(0xFF1565C0)],
                  ),
                  borderRadius: BorderRadius.circular(25),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF2962FF).withValues(alpha: 0.3),
                      blurRadius: 15,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "TAGIHAN BULAN INI",
                      style: GoogleFonts.outfit(
                        color: Colors.white.withValues(alpha: 0.8),
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 1,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      "Rp ${_formatNumber(_currentBill)}",
                      style: GoogleFonts.outfit(
                        color: Colors.white,
                        fontSize: 36,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 25),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 10,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.calendar_today_outlined,
                            color: Colors.white,
                            size: 16,
                          ),
                          const SizedBox(width: 10),
                          Text(
                            "Jatuh tempo: $_dueDate",
                            style: GoogleFonts.outfit(
                              color: Colors.white,
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              // Pay Now Button
              if (!_isPaid)
                _AnimatedPayButton(
                  onPressed: () => _showPaymentMethod(context),
                ),
              const SizedBox(height: 35),
              // Payment History Container
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: Colors.grey.shade100),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "Riwayat Pembayaran",
                      style: GoogleFonts.outfit(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                      ),
                    ),
                    const SizedBox(height: 20),
                    if (_billingHistory.isEmpty)
                      const Center(child: Text("Belum ada riwayat pembayaran."))
                    else
                      ..._billingHistory.map((item) {
                        return _historyItem(
                          "Rp ${_formatNumber((item['jumlah_tagihan'] ?? 0).toInt())}",
                          item['metode_pembayaran']?.toString() ?? "N/A",
                          _formatDate(
                            item['tanggal_pembayaran']?.toString() ?? "",
                          ),
                          item['nomor_invoice']?.toString() ?? "N/A",
                          isFirst: _billingHistory.indexOf(item) == 0,
                        );
                      }),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatDate(String isoString) {
    try {
      final date = DateTime.parse(isoString);
      return "${date.day} ${_getMonth(date.month)} ${date.year}";
    } catch (e) {
      return isoString;
    }
  }

  String _getMonth(int month) {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];
    return months[month - 1];
  }



  // Format tanggal ke string Indonesia tanpa perlu locale initialization
  String _formatDueDate(DateTime date) {
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    return "${date.day} ${months[date.month - 1]} ${date.year}";
  }

  String _formatNumber(int number) {
    return number.toString().replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]}.',
    );
  }

  void _showPaymentMethod(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) {
        return DraggableScrollableSheet(
          initialChildSize: 0.6,
          minChildSize: 0.4,
          maxChildSize: 0.9,
          builder: (_, controller) {
            return Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
              ),
              padding: const EdgeInsets.fromLTRB(30, 20, 30, 30),
              child: ListView(
                controller: controller,
                children: [
                  Center(
                    child: Container(
                      width: 40,
                      height: 5,
                      margin: const EdgeInsets.only(bottom: 20),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade300,
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        "Pilih Metode Pembayaran",
                        style: GoogleFonts.outfit(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      GestureDetector(
                        onTap: () => Navigator.pop(context),
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(
                            color: Colors.grey.shade100,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.close,
                            size: 20,
                            color: Colors.grey,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 25),
                  _buildPaymentOption(
                    context,
                    Icons.account_balance_outlined,
                    "Transfer Bank",
                    "BCA, Mandiri, BNI, BRI",
                    Colors.blue.shade50,
                    Colors.blue.shade700,
                    () => _showUploadProof(context, "BCA", "1234567890"),
                  ),
                  _buildPaymentOption(
                    context,
                    Icons.account_balance_wallet_outlined,
                    "E-Wallet",
                    "GoPay, OVO, Dana, ShopeePay",
                    Colors.green.shade50,
                    Colors.green.shade700,
                    () => _showUploadProof(context, "GoPay", "08123456789"),
                  ),
                  _buildPaymentOption(
                    context,
                    Icons.credit_card_outlined,
                    "Kartu Kredit/Debit",
                    "Visa, Mastercard",
                    Colors.purple.shade50,
                    Colors.purple.shade700,
                    () => _showUploadProof(
                      context,
                      "VA Merchant",
                      "880123456789",
                    ),
                  ),
                  const SizedBox(height: 10),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildPaymentOption(
    BuildContext context,
    IconData icon,
    String title,
    String subtitle,
    Color bgColor,
    Color iconColor,
    VoidCallback onTap,
  ) {
    return _InteractivePaymentTile(
      icon: icon,
      title: title,
      subtitle: subtitle,
      bgColor: bgColor,
      iconColor: iconColor,
      onTap: () {
        Navigator.pop(context);
        onTap();
      },
    );
  }

  Widget _historyItem(
    String price,
    String method,
    String date,
    String inv, {
    bool isFirst = false,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isFirst ? const Color(0xFF2962FF) : Colors.grey.shade100,
          width: isFirst ? 1.5 : 1,
        ),
        boxShadow: isFirst
            ? [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ]
            : null,
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: const BoxDecoration(
                  color: Color(0xFFE8F5E9),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check, color: Colors.green, size: 20),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      price,
                      style: GoogleFonts.outfit(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    Text(
                      method,
                      style: GoogleFonts.outfit(
                        color: Colors.grey,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE8F5E9),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      "Berhasil",
                      style: GoogleFonts.outfit(
                        color: Colors.green,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    date,
                    style: GoogleFonts.outfit(color: Colors.grey, fontSize: 12),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 15),
          const Divider(height: 1),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  "Invoice: $inv",
                  style: GoogleFonts.outfit(
                    fontSize: 12,
                    color: Colors.grey.shade600,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              InkWell(
                onTap: () => PdfService.generateInvoice(
                  amount: price,
                  method: method,
                  date: date,
                  invoiceNumber: inv,
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.file_download_outlined,
                      size: 16,
                      color: Color(0xFF2962FF),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      "Download",
                      style: GoogleFonts.outfit(
                        fontSize: 13,
                        color: const Color(0xFF2962FF),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _AnimatedPayButton extends StatefulWidget {
  final VoidCallback onPressed;
  const _AnimatedPayButton({required this.onPressed});

  @override
  State<_AnimatedPayButton> createState() => _AnimatedPayButtonState();
}

class _AnimatedPayButtonState extends State<_AnimatedPayButton> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _isPressed = true),
      onTapUp: (_) => setState(() => _isPressed = false),
      onTapCancel: () => setState(() => _isPressed = false),
      onTap: widget.onPressed,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        curve: Curves.easeOut,
        width: double.infinity,
        height: 55,
        decoration: BoxDecoration(
          color: const Color(0xFF2962FF),
          borderRadius: BorderRadius.circular(16),
          boxShadow: _isPressed
              ? []
              : [
                  BoxShadow(
                    color: const Color(0xFF2962FF).withValues(alpha: 0.3),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
          border: Border.all(
            color: _isPressed
                ? Colors.white.withValues(alpha: 0.8)
                : Colors.transparent,
            width: 2,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.account_balance_wallet_outlined,
              color: Colors.white,
            ),
            const SizedBox(width: 12),
            Text(
              "Bayar Sekarang",
              style: GoogleFonts.outfit(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _InteractivePaymentTile extends StatefulWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final Color bgColor;
  final Color iconColor;
  final VoidCallback onTap;

  const _InteractivePaymentTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.bgColor,
    required this.iconColor,
    required this.onTap,
  });

  @override
  State<_InteractivePaymentTile> createState() =>
      _InteractivePaymentTileState();
}

class _InteractivePaymentTileState extends State<_InteractivePaymentTile> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _isHovered = true),
      onTapUp: (_) => setState(() => _isHovered = false),
      onTapCancel: () => setState(() => _isHovered = false),
      onTap: widget.onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: const EdgeInsets.only(bottom: 15),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: _isHovered ? widget.bgColor.withValues(alpha: 0.3) : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: _isHovered ? widget.iconColor : Colors.grey.shade100,
            width: _isHovered ? 2 : 1,
          ),
          boxShadow: _isHovered
              ? [
                  BoxShadow(
                    color: widget.iconColor.withValues(alpha: 0.1),
                    blurRadius: 8,
                    offset: const Offset(0, 4),
                  ),
                ]
              : [],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: widget.bgColor,
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(widget.icon, color: widget.iconColor),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.title,
                    style: GoogleFonts.outfit(
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                    ),
                  ),
                  Text(
                    widget.subtitle,
                    style: GoogleFonts.outfit(color: Colors.grey, fontSize: 12),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: Colors.grey, size: 20),
          ],
        ),
      ),
    );
  }
}

class _InteractiveUploadCard extends StatefulWidget {
  final VoidCallback onTap;
  const _InteractiveUploadCard({required this.onTap});

  @override
  State<_InteractiveUploadCard> createState() => _InteractiveUploadCardState();
}

class _InteractiveUploadCardState extends State<_InteractiveUploadCard> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _isPressed = true),
      onTapUp: (_) => setState(() => _isPressed = false),
      onTapCancel: () => setState(() => _isPressed = false),
      onTap: widget.onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 40),
        decoration: BoxDecoration(
          color: _isPressed
              ? Colors.blue.shade50.withValues(alpha: 0.5)
              : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: _isPressed ? const Color(0xFF2962FF) : Colors.transparent,
            width: 2,
          ),
        ),
        child: Stack(
          children: [
            Positioned.fill(
              child: CustomPaint(
                painter: DashedRectPainter(
                  color: _isPressed
                      ? const Color(0xFF2962FF)
                      : Colors.grey.shade300,
                ),
              ),
            ),
            Center(
              child: Column(
                children: [
                  Icon(
                    Icons.upload_outlined,
                    size: 40,
                    color: _isPressed
                        ? const Color(0xFF2962FF)
                        : Colors.grey.shade400,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    "Upload Bukti Transfer",
                    style: GoogleFonts.outfit(
                      fontWeight: FontWeight.bold,
                      color: _isPressed
                          ? const Color(0xFF2962FF)
                          : Colors.black87,
                    ),
                  ),
                  Text(
                    "JPG, PNG (Max 5MB)",
                    style: GoogleFonts.outfit(
                      fontSize: 12,
                      color: _isPressed
                          ? const Color(0xFF2962FF).withValues(alpha: 0.7)
                          : Colors.grey,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class DashedRectPainter extends CustomPainter {
  final Color color;
  DashedRectPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    double dashWidth = 5, dashSpace = 3, startX = 0;
    final paint = Paint()
      ..color = color
      ..strokeWidth = 1
      ..style = PaintingStyle.stroke;

    while (startX < size.width) {
      canvas.drawLine(Offset(startX, 0), Offset(startX + dashWidth, 0), paint);
      canvas.drawLine(
        Offset(startX, size.height),
        Offset(startX + dashWidth, size.height),
        paint,
      );
      startX += dashWidth + dashSpace;
    }
    double startY = 0;
    while (startY < size.height) {
      canvas.drawLine(Offset(0, startY), Offset(0, startY + dashWidth), paint);
      canvas.drawLine(
        Offset(size.width, startY),
        Offset(size.width, startY + dashWidth),
        paint,
      );
      startY += dashWidth + dashSpace;
    }
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
}
