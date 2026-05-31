import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../widgets/loading_logo.dart';
import '../main.dart';

class PackagePage extends StatefulWidget {
  const PackagePage({super.key});

  @override
  State<PackagePage> createState() => _PackagePageState();
}

class _PackagePageState extends State<PackagePage> {
  final TextEditingController _passwordController = TextEditingController();

  List<dynamic> _packages = [];
  bool _isLoading = true;
  String _currentPackage = "Loading...";
  int _activePackagePrice = 0; // Harga asli paket yang aktif (untuk display)
  int _currentBill = 0; // Sisa tagihan bulan ini
  bool _isPaid = false;
  int _paymentCount = 0; // Jumlah transaksi paket bulan ini
  int _totalPaidThisMonth = 0;

  @override
  void initState() {
    super.initState();
    _fetchInitialData();
  }

  @override
  void didUpdateWidget(PackagePage oldWidget) {
    super.didUpdateWidget(oldWidget);
    _fetchInitialData();
  }

  Future<void> _fetchInitialData() async {
    if (!mounted) return;
    setState(() => _isLoading = true);
    await Future.wait([fetchPackages(), _fetchCurrentSubscription()]);
    if (mounted) setState(() => _isLoading = false);
  }

  Future<void> _fetchCurrentSubscription() async {
    try {
      final user = Supabase.instance.client.auth.currentUser;
      if (user != null) {
        final data = await Supabase.instance.client
            .from('profile_customer')
            .select('paket_aktif, tagihan_saat_ini')
            .eq('id', user.id)
            .maybeSingle();

        // Ambil data riwayat pembayaran untuk verifikasi kelunasan
        final billingData = await Supabase.instance.client
            .from('billing_customer')
            .select('jumlah_tagihan, status_pembayaran, tanggal_pembayaran')
            .eq('id_user', user.id);

        if (mounted) {
          int totalTagihan = (data?['tagihan_saat_ini'] ?? 0).toInt();
          int totalPaid = 0;
          final now = DateTime.now();

          // Hitung total pembayaran berhasil bulan ini
          int paymentCount = 0;
          for (var item in (billingData as List<dynamic>? ?? [])) {
            if (item['status_pembayaran'] == 'Berhasil') {
              try {
                final rawDate = item['tanggal_pembayaran'];
                if (rawDate != null) {
                  DateTime payDate = DateTime.parse(rawDate.toString());
                  if (payDate.month == now.month && payDate.year == now.year) {
                    totalPaid += ((item['jumlah_tagihan'] as num?) ?? 0)
                        .toInt();
                    paymentCount++;
                  }
                }
              } catch (_) {}
            }
          }

          setState(() {
            _paymentCount = paymentCount;
            _totalPaidThisMonth = totalPaid;
            _currentBill = totalTagihan - totalPaid;
            if (_currentBill < 0) _currentBill = 0;
            
            // Status lunas jika sisa tagihan 0
            _isPaid = _currentBill <= 0;
            _currentPackage = data?['paket_aktif'] ?? "Belum ada paket";

            // Cari harga terakhir yang dibayar sebagai backup Paket Lama
            _fetchLatestPaymentPrice(user.id);
          });
        }
      }
    } catch (e) {
      debugPrint("Error fetch subscription: $e");
    }
  }

  Future<void> _fetchLatestPaymentPrice(String userId) async {
    try {
      final latest = await Supabase.instance.client
          .from('billing_customer')
          .select('jumlah_tagihan')
          .eq('id_user', userId)
          .eq('status_pembayaran', 'Berhasil')
          .order('tanggal_pembayaran', ascending: false)
          .limit(1)
          .maybeSingle();

      if (latest != null && mounted) {
        setState(() {
          _activePackagePrice = (latest['jumlah_tagihan'] as num).toInt();
        });
      }
    } catch (_) {}
  }

  Future<void> fetchPackages() async {
    try {
      final data = await Supabase.instance.client.from('paket').select('*');

      if (mounted) {
        setState(() {
          _packages = data as List<dynamic>;

          // Cari harga paket aktif dari daftar paket
          if (_currentPackage != "Loading..." &&
              _currentPackage != "Belum ada paket") {
            Map<String, dynamic>? activePkg;
            for (var p in _packages) {
              if ((p['nama_paket'] ?? p['title']) == _currentPackage) {
                activePkg = p as Map<String, dynamic>;
                break;
              }
            }
            if (activePkg != null) {
              _activePackagePrice =
                  (activePkg['harga'] ?? activePkg['price'] ?? 0).toInt();
            }
          }

          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text("Error: $e")));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const LoadingLogo();
    }
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          "Upgrade Paket",
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        elevation: 0,
        backgroundColor: Colors.transparent,
        foregroundColor: Colors.black,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              setState(() => _isLoading = true);
              fetchPackages();
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Paket Saat Ini Card
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: Colors.grey.shade200),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.05),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF0F5FF),
                            borderRadius: BorderRadius.circular(15),
                          ),
                          child: const Icon(
                            Icons.layers_outlined,
                            color: Color(0xFF246BFD),
                          ),
                        ),
                        const SizedBox(width: 15),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                "PAKET AKTIF BULAN INI",
                                style: TextStyle(
                                  fontSize: 10,
                                  color: Colors.grey,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 1.1,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                _currentPackage,
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.black87,
                                ),
                              ),
                              if (_activePackagePrice > 0)
                                Text(
                                  "Rp ${_formatNumber(_activePackagePrice)}/bln",
                                  style: const TextStyle(
                                    fontSize: 13,
                                    color: Colors.grey,
                                  ),
                                ),
                            ],
                          ),
                        ),
                        if (!_isPaid)
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 10,
                              vertical: 5,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.orange.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Text(
                              "Belum Bayar",
                              style: TextStyle(
                                color: Colors.orange,
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 25),
                  const Text(
                    "Pilih Paket Baru",
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 15),

                  // --- DATA DARI SUPABASE ---
                  if (_packages.isEmpty)
                    const Center(child: Text("Tidak ada paket tersedia."))
                  else
                    ..._packages.map((pkg) {
                      final name = pkg['nama_paket'] ?? pkg['title'] ?? 'Paket';
                      final isActive = name == _currentPackage;

                      return _packageCard(
                        title: name,
                        price: "Rp ${pkg['harga'] ?? pkg['price'] ?? '0'}/bln",
                        icon: Icons.bolt,
                        isPopular: pkg['is_popular'] ?? false,
                        isActive: isActive,
                        features: pkg['deskripsi'] != null
                            ? [pkg['deskripsi']]
                            : ["Akses internet cepat", "Tanpa batas FUP"],
                        onSelect: () {
                          if (isActive) return; // Sudah aktif, tidak perlu pilih lagi
                          
                          if (_paymentCount >= 2) {
                            _showLimitWarning(context);
                            return;
                          }

                          if (!_isPaid) {
                            _showUnpaidWarning(context);
                          } else {
                            _showUpgradeConfirmation(
                              context,
                              name,
                              "Rp ${pkg['harga'] ?? pkg['price'] ?? '0'}/bln",
                              pkg['harga']?.toString() ?? '0',
                            );
                          }
                        },
                      );
                    }),
                ],
              ),
            ),
    );
  }

  void _showLimitWarning(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(25)),
        title: Row(
          children: [
            Icon(Icons.info_outline, color: Colors.blue.shade700),
            const SizedBox(width: 10),
            const Text("Batas Transaksi"),
          ],
        ),
        content: const Text(
          "Maaf, Anda telah mencapai batas maksimal transaksi paket (2 kali) untuk bulan ini. Silakan coba kembali bulan depan.",
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Tutup"),
          ),
        ],
      ),
    );
  }

  void _showUnpaidWarning(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(25)),
        title: Row(
          children: [
            Icon(Icons.warning_amber_rounded, color: Colors.orange.shade700),
            const SizedBox(width: 10),
            const Expanded(child: Text("Tagihan Belum Lunas")),
          ],
        ),
        content: const Text(
          "Maaf, Anda memiliki tagihan yang belum dibayar. Silakan lakukan pelunasan di menu Pembayaran terlebih dahulu sebelum dapat mengganti atau upgrade paket.",
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Tutup"),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              final mainNav = MainNavigation.of(context);
              mainNav?.changeIndex(0, openPayment: true);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF246BFD),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            child: const Text(
              "Bayar Sekarang",
              style: TextStyle(color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }

  void _showUpgradeConfirmation(
    BuildContext context,
    String newPackage,
    String newPrice,
    String rawNewPrice,
  ) {
    int newPkgPrice = int.tryParse(rawNewPrice) ?? 0;

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
        contentPadding: const EdgeInsets.all(25),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "Konfirmasi Upgrade",
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFFF0F5FF),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      const CircleAvatar(
                        backgroundColor: Color(0xFF246BFD),
                        child: Icon(Icons.bolt, color: Colors.white),
                      ),
                      const SizedBox(width: 15),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              "Upgrade ke",
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.grey,
                              ),
                            ),
                            Text(
                              newPackage,
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 15),
                    child: Divider(),
                  ),
                  _rowSummary(
                    "Paket Lama",
                    "Rp ${_formatNumber(_activePackagePrice)}/bln",
                  ),
                  const SizedBox(height: 5),
                  _rowSummary("Paket Baru", newPrice),
                  const Divider(height: 25),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Expanded(
                        child: Text(
                          "Total Harga",
                          style: TextStyle(fontWeight: FontWeight.bold),
                        ),
                      ),
                      Text(
                        "Rp ${_formatNumber(newPkgPrice)}",
                        style: const TextStyle(
                          color: Color(0xFF246BFD),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF9E6),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Text(
                "Paket baru akan aktif mulai tanggal 1 bulan depan. Tagihan bulan ini tetap menggunakan paket lama.",
                style: TextStyle(fontSize: 11, color: Colors.orange),
              ),
            ),
            const SizedBox(height: 25),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 15),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(15),
                      ),
                    ),
                    child: const Text("Batal"),
                  ),
                ),
                const SizedBox(width: 15),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.pop(context);
                      _showPasswordVerification(context, newPackage, rawNewPrice);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF246BFD),
                      padding: const EdgeInsets.symmetric(vertical: 15),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(15),
                      ),
                    ),
                    child: const Text(
                      "Lanjutkan",
                      style: TextStyle(color: Colors.white),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showPasswordVerification(
    BuildContext context,
    String newPackage,
    String rawNewPrice,
  ) {
    showDialog(
      context: context,
      builder: (context) {
        bool isVerifying = false;
        bool isObscure = true;
        return StatefulBuilder(
          builder: (context, setModalState) {
            return AlertDialog(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(30),
              ),
              contentPadding: const EdgeInsets.all(25),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const CircleAvatar(
                    radius: 35,
                    backgroundColor: Color(0xFFF0F5FF),
                    child: Icon(
                      Icons.lock_outline,
                      color: Color(0xFF246BFD),
                      size: 35,
                    ),
                  ),
                  const SizedBox(height: 20),
                  const Text(
                    "Verifikasi Password",
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 10),
                  const Text(
                    "Masukkan password Anda untuk melanjutkan upgrade",
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.grey, fontSize: 13),
                  ),
                  const SizedBox(height: 25),
                  const Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      "Password",
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _passwordController,
                    obscureText: isObscure,
                    decoration: InputDecoration(
                      hintText: "Masukkan password Anda",
                      hintStyle: const TextStyle(fontSize: 14),
                      filled: true,
                      fillColor: Colors.grey.shade50,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(15),
                        borderSide: BorderSide(color: Colors.grey.shade300),
                      ),
                      suffixIcon: IconButton(
                        icon: Icon(
                          isObscure ? Icons.visibility_off : Icons.visibility,
                        ),
                        onPressed: () =>
                            setModalState(() => isObscure = !isObscure),
                      ),
                    ),
                  ),
                  const SizedBox(height: 25),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => Navigator.pop(context),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 15),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(15),
                            ),
                          ),
                          child: const Text("Batal"),
                        ),
                      ),
                      const SizedBox(width: 15),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: isVerifying
                              ? null
                              : () async {
                                  if (_passwordController.text.isEmpty) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(content: Text("Password harus diisi")),
                                    );
                                    return;
                                  }

                                  setModalState(() => isVerifying = true);
                                  try {
                                    final user = Supabase.instance.client.auth.currentUser;
                                    if (user != null && user.email != null) {
                                      // 1. Verifikasi password dengan mencoba login ulang
                                      await Supabase.instance.client.auth.signInWithPassword(
                                        email: user.email!,
                                        password: _passwordController.text,
                                      );

                                      // 2. Jika berhasil (tidak throw error), jalankan logika upgrade
                                      String priceClean = rawNewPrice
                                          .replaceAll('Rp ', '')
                                          .replaceAll('.', '')
                                          .replaceAll('/bln', '');
                                      int newPackagePrice = int.tryParse(priceClean) ?? 0;

                                      // Hitung finalBill agar saat masuk ke billing, sisa tagihan menjadi newPackagePrice
                                      // totalTagihan (tagihan_saat_ini) harus = newPackagePrice + _totalPaidThisMonth
                                      int finalBill = newPackagePrice + _totalPaidThisMonth;

                                      await Supabase.instance.client
                                          .from('profile_customer')
                                          .update({
                                            'paket_aktif': newPackage,
                                            'tagihan_saat_ini': finalBill,
                                            'is_tagihan_paid': false,
                                          })
                                          .eq('id', user.id);

                                      if (!context.mounted) return;
                                      Navigator.pop(context); // Tutup dialog
                                      _passwordController.clear();
                                      await _fetchInitialData(); // Re-fetch all data
                                      if (!context.mounted) return;
                                      _showUpgradeSuccess(context, newPackage);
                                    }
                                  } catch (e) {
                                    if (!context.mounted) return;
                                    setModalState(() => isVerifying = false);
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(
                                        content: Text("Password salah atau verifikasi gagal"),
                                        backgroundColor: Colors.red,
                                      ),
                                    );
                                  }
                                },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF246BFD),
                            padding: const EdgeInsets.symmetric(vertical: 15),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(15),
                            ),
                          ),
                          child: isVerifying
                              ? const SizedBox(
                                  height: 20,
                                  width: 20,
                                  child: CircularProgressIndicator(
                                    color: Colors.white,
                                    strokeWidth: 2,
                                  ),
                                )
                              : const Text(
                                  "Verifikasi",
                                  style: TextStyle(color: Colors.white),
                                ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _showUpgradeSuccess(BuildContext context, String newPackage) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
        contentPadding: const EdgeInsets.all(30),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const CircleAvatar(
              radius: 40,
              backgroundColor: Color(0xFFE8F5E9),
              child: Icon(Icons.check, color: Colors.green, size: 50),
            ),
            const SizedBox(height: 25),
            const Text(
              "Upgrade Berhasil!",
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 15),
            Text(
              "Paket Anda telah berhasil diupgrade ke $newPackage",
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.grey, fontSize: 14),
            ),
            const SizedBox(height: 5),
            const Text(
              "Paket baru akan aktif mulai 1 November 2026",
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey, fontSize: 12),
            ),
            const SizedBox(height: 30),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF246BFD),
                  padding: const EdgeInsets.symmetric(vertical: 15),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(15),
                  ),
                ),
                child: const Text(
                  "Tutup",
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _rowSummary(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 13)),
        Text(value, style: const TextStyle(fontSize: 13)),
      ],
    );
  }

  Widget _packageCard({
    required String title,
    required String price,
    required IconData icon,
    required bool isPopular,
    required List<String> features,
    required VoidCallback onSelect,
    bool isActive = false,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isPopular ? const Color(0xFFF0F5FF) : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF246BFD).withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (isPopular)
            Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFF246BFD),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Text(
                "Terpopuler",
                style: TextStyle(color: Colors.white, fontSize: 10),
              ),
            ),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFF246BFD),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: Colors.white),
              ),
              const SizedBox(width: 15),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    Text(
                      price,
                      style: const TextStyle(
                        color: Color(0xFF246BFD),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 15),
          ...features.map(
            (f) => Padding(
              padding: const EdgeInsets.only(bottom: 5),
              child: Row(
                children: [
                  const Icon(Icons.check_circle, color: Colors.green, size: 16),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      f,
                      style: const TextStyle(
                        fontSize: 13,
                        color: Colors.black87,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 15),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: (isActive || (!_isPaid && !isActive)) ? onSelect : onSelect,
              style: ElevatedButton.styleFrom(
                backgroundColor: isActive 
                    ? Colors.green 
                    : (!_isPaid ? Colors.grey : const Color(0xFF246BFD)),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: Text(
                isActive 
                    ? "Paket Aktif" 
                    : (!_isPaid ? "Tagihan Belum Lunas" : "Pilih Paket Ini"),
                style: const TextStyle(color: Colors.white),
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _formatNumber(int number) {
    return number.toString().replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]}.',
    );
  }
}
