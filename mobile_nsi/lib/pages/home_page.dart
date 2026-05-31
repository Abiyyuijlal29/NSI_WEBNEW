import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../main.dart';
import '../widgets/loading_logo.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  String _name = "User";
  int _bill = 0;
  bool _isPaid = false;
  bool _isLoading = true;
  String _dueDate = "15 Oktober 2026"; // Fallback
  String _periodeLangganan = "";

  @override
  void initState() {
    super.initState();
    _fetchUserData();
  }

  @override
  void didUpdateWidget(HomePage oldWidget) {
    super.didUpdateWidget(oldWidget);
    _fetchUserData();
  }

  Future<void> _fetchUserData() async {
    try {
      final user = Supabase.instance.client.auth.currentUser;
      if (user != null) {
        // Ambil data profile (nama dan total tagihan)
        final profileData = await Supabase.instance.client
            .from('profile_customer')
            .select('nama_lengkap, tagihan_saat_ini, created_at')
            .eq('id', user.id)
            .maybeSingle();

        // Ambil data riwayat pembayaran untuk menghitung sisa tagihan
        final billingData = await Supabase.instance.client
            .from('billing_customer')
            .select('jumlah_tagihan, status_pembayaran, tanggal_pembayaran')
            .eq('id_user', user.id);

        if (mounted) {
          int totalTagihan = (profileData?['tagihan_saat_ini'] ?? 0).toInt();
          int totalPaid = 0;
          final now = DateTime.now();

          DateTime? lastPaymentDate;
          // Hitung total pembayaran yang berhasil untuk bulan ini
          for (var item in (billingData as List<dynamic>? ?? [])) {
            if (item['status_pembayaran'] == 'Berhasil') {
              try {
                final rawDate = item['tanggal_pembayaran'];
                if (rawDate != null) {
                  DateTime payDate = DateTime.parse(rawDate.toString());
                  if (lastPaymentDate == null ||
                      payDate.isAfter(lastPaymentDate)) {
                    lastPaymentDate = payDate;
                  }
                  if (payDate.month == now.month && payDate.year == now.year) {
                    final amount =
                        item['jumlah_tagihan'] ??
                        item['jumlah_pembayaran'] ??
                        0;
                    totalPaid += (amount as num).toInt();
                  }
                }
              } catch (_) {}
            }
          }

          String calculatedPeriod = _getCurrentPeriod(); // default fallback
          if (lastPaymentDate != null) {
            final months = [
              "Januari",
              "Februari",
              "Maret",
              "April",
              "Mei",
              "Juni",
              "Juli",
              "Agustus",
              "September",
              "Oktober",
              "November",
              "Desember",
            ];
            DateTime nextMonth = DateTime(
              lastPaymentDate.year,
              lastPaymentDate.month + 1,
              lastPaymentDate.day,
            );
            calculatedPeriod =
                "${lastPaymentDate.day} ${months[lastPaymentDate.month - 1]} - ${nextMonth.day} ${months[nextMonth.month - 1]}";
          }

          setState(() {
            _name = profileData?['nama_lengkap'] ?? "User";
            // Sisa tagihan
            _bill = totalTagihan - totalPaid;
            if (_bill < 0) _bill = 0;

            // Status lunas jika sisa tagihan 0 atau kurang
            _isPaid = _bill <= 0;
            // Hitung jatuh tempo: tanggal pembayaran terakhir yang berhasil + 1 bulan
            // lastPaymentDate sudah dihitung di loop atas (pembayaran terbaru)
            if (lastPaymentDate != null) {
              DateTime due = DateTime(
                lastPaymentDate.year,
                lastPaymentDate.month + 1,
                lastPaymentDate.day,
              );
              _dueDate = _formatDueDate(due);
            } else if (profileData?['created_at'] != null) {
              try {
                DateTime created = DateTime.parse(
                  profileData!['created_at'].toString(),
                );
                DateTime due = DateTime(
                  created.year,
                  created.month + 1,
                  created.day,
                );
                _dueDate = _formatDueDate(due);
              } catch (_) {
                _dueDate = _formatDueDate(
                  DateTime.now().add(const Duration(days: 30)),
                );
              }
            } else {
              _dueDate = _formatDueDate(
                DateTime.now().add(const Duration(days: 30)),
              );
            }

            _periodeLangganan = calculatedPeriod;
            _isLoading = false;
          });
        }
      } else {
        if (mounted) {
          setState(() => _isLoading = false);
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const LoadingLogo();
    }
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 40),
          // Header / Welcome
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      "Selamat Datang,",
                      style: TextStyle(color: Colors.grey, fontSize: 14),
                    ),
                    Text(
                      _name,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1A1A1A),
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              GestureDetector(
                onTap: () => MainNavigation.of(context)?.changeIndex(4),
                child: const CircleAvatar(
                  radius: 25,
                  backgroundColor: Color(0xFF246BFD),
                  child: Icon(Icons.person, color: Colors.white),
                ),
              ),
            ],
          ),

          const SizedBox(height: 25),

          // Section: Informasi Pembayaran
          _buildSectionHeader(
            Icons.calendar_today_outlined,
            "Informasi Pembayaran",
          ),
          const SizedBox(height: 15),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(15),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFF9E6),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFFFFE58F)),
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                "Tagihan Bulan Ini",
                                style: TextStyle(
                                  color: Colors.grey,
                                  fontSize: 12,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                "Rp ${_formatNumber(_bill)}",
                                style: TextStyle(
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF1A1A1A),
                                ),
                              ),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 6,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              _isPaid ? "Lunas" : "Belum Bayar",
                              style: TextStyle(
                                color: _isPaid ? Colors.green : Colors.orange,
                                fontWeight: FontWeight.bold,
                                fontSize: 11,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 12),
                        child: Divider(color: Color(0xFFFFE58F)),
                      ),
                      Row(
                        children: [
                          const Icon(
                            Icons.event_note,
                            size: 16,
                            color: Colors.grey,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            "Jatuh tempo: $_dueDate",
                            style: const TextStyle(
                              color: Colors.grey,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                Row(
                  children: [
                    Expanded(
                      child: _buildInfoItem(
                        "Periode Langganan",
                        _periodeLangganan.isNotEmpty
                            ? _periodeLangganan
                            : _getCurrentPeriod(),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _buildInfoItem(
                        "Tanggal Bayar",
                        _getTanggalBayar(),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                if (!_isPaid)
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () => MainNavigation.of(
                        context,
                      )?.changeIndex(0, openPayment: true),
                      icon: const Icon(
                        Icons.account_balance_wallet_outlined,
                        size: 18,
                      ),
                      label: const Text(
                        "Bayar Tagihan",
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF246BFD),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 15),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(15),
                        ),
                        elevation: 0,
                      ),
                    ),
                  ),
              ],
            ),
          ),

          const SizedBox(height: 30),

          // Section: Menu Cepat
          const Text(
            "Menu Cepat",
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 15),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildQuickMenu(
                context,
                Icons.account_balance_wallet_outlined,
                "Billing",
                () => MainNavigation.of(context)?.changeIndex(0),
              ),
              _buildQuickMenu(
                context,
                Icons.trending_up,
                "Package",
                () => MainNavigation.of(context)?.changeIndex(1),
              ),
              _buildQuickMenu(
                context,
                Icons.headset_mic_outlined,
                "CS",
                () => MainNavigation.of(context)?.changeIndex(3),
              ),
            ],
          ),

          const SizedBox(height: 30),

          // Section: Penggunaan Bulan Ini
          const Text(
            "Penggunaan Bulan Ini",
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 15),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      "Data Usage",
                      style: TextStyle(color: Colors.grey, fontSize: 14),
                    ),
                    const Text(
                      "425 GB",
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 15),
                ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: const LinearProgressIndicator(
                    value: 0.45,
                    minHeight: 8,
                    backgroundColor: Color(0xFFF1F1F1),
                    valueColor: AlwaysStoppedAnimation<Color>(
                      Color(0xFF246BFD),
                    ),
                  ),
                ),
                const SizedBox(height: 15),
                const Text(
                  "Unlimited - Tidak ada batas kuota",
                  style: TextStyle(color: Colors.grey, fontSize: 12),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(IconData icon, String title) {
    return Row(
      children: [
        Icon(icon, color: const Color(0xFF246BFD), size: 20),
        const SizedBox(width: 10),
        Text(
          title,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: Color(0xFF1A1A1A),
          ),
        ),
      ],
    );
  }

  Widget _buildInfoItem(String label, String value) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFF8F9FA),
        borderRadius: BorderRadius.circular(15),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey, fontSize: 10)),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1A1A1A),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickMenu(
    BuildContext context,
    IconData icon,
    String label,
    VoidCallback onTap,
  ) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        width: 100,
        padding: const EdgeInsets.symmetric(vertical: 20),
        decoration: BoxDecoration(
          color: const Color(0xFFF0F5FF),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Column(
          children: [
            Icon(icon, color: const Color(0xFF246BFD)),
            const SizedBox(height: 10),
            Text(
              label,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: Color(0xFF246BFD),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatNumber(int number) {
    return number.toString().replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]}.',
    );
  }

  String _getCurrentPeriod() {
    final now = DateTime.now();
    final firstDay = 1;
    final lastDay = DateTime(now.year, now.month + 1, 0).day;
    final months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    return "$firstDay ${months[now.month - 1]} - $lastDay ${months[now.month - 1]}";
  }



  // Format tanggal ke string Indonesia tanpa perlu locale initialization
  String _formatDueDate(DateTime date) {
    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    return "${date.day} ${months[date.month - 1]} ${date.year}";
  }

  String _getTanggalBayar() {
    final now = DateTime.now();
    final dueDate = DateTime(now.year, now.month + 1, now.day);
    return "Setiap tgl ${dueDate.day}";
  }
}
