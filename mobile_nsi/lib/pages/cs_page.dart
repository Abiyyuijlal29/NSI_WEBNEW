import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class CSPage extends StatefulWidget {
  const CSPage({super.key});

  @override
  State<CSPage> createState() => _CSPageState();
}

class _CSPageState extends State<CSPage> {
  final ScrollController _scrollController = ScrollController();
  String? _selectedCategory;
  final TextEditingController _messageController = TextEditingController();
  List<dynamic> _faqs = [];
  List<dynamic> _categories = [];
  bool _isLoadingFaqs = true;
  bool _isLoadingCategories = true;

  @override
  void initState() {
    super.initState();
    _fetchFAQs();
    _fetchCategories();
  }

  Future<void> _fetchCategories() async {
    try {
      final data = await Supabase.instance.client
          .from('kategori_masalah')
          .select('nama_kategori')
          .order('nama_kategori', ascending: true);

      if (mounted) {
        setState(() {
          _categories = data as List<dynamic>;
          _isLoadingCategories = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoadingCategories = false);
      }
    }
  }

  Future<void> _fetchFAQs() async {
    try {
      final data = await Supabase.instance.client
          .from('faq')
          .select('*')
          .eq('is_active', true)
          .order('category', ascending: true)
          .order('sort_order', ascending: true);

      if (mounted) {
        setState(() {
          _faqs = data as List<dynamic>;
          _isLoadingFaqs = false;
        });
      }
    } catch (e) {
      debugPrint("Error fetching FAQs: $e");
      if (mounted) {
        setState(() => _isLoadingFaqs = false);
      }
    }
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  Future<void> _launchWhatsApp() async {
    final Uri url = Uri.parse("https://wa.me/628123456789");
    if (!await launchUrl(url, mode: LaunchMode.externalApplication)) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Tidak bisa membuka WhatsApp")),
        );
      }
    }
  }

  Future<void> _launchPhone() async {
    final Uri url = Uri.parse("tel:1500123");
    if (!await launchUrl(url)) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Tidak bisa melakukan panggilan")),
        );
      }
    }
  }

  Future<void> _submitComplaint() async {
    if (_selectedCategory == null || _messageController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Silakan lengkapi kategori dan deskripsi"),
        ),
      );
      return;
    }

    try {
      final user = Supabase.instance.client.auth.currentUser;
      if (user == null) return;

      await Supabase.instance.client.from('pengaduan').insert({
        'id_user': user.id,
        'kategori': _selectedCategory,
        'pesan': _messageController.text.trim(),
        'status': 'Terbuka',
      });

      if (mounted) {
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.check_circle, color: Colors.green, size: 60),
                const SizedBox(height: 20),
                Text(
                  "Pengaduan Terkirim!",
                  style: GoogleFonts.outfit(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  "Terima kasih. Laporan Anda telah kami terima dan akan segera diproses oleh tim kami.",
                  textAlign: TextAlign.center,
                  style: GoogleFonts.outfit(color: Colors.grey),
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context);
                    setState(() {
                      _selectedCategory = null;
                      _messageController.clear();
                    });
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF246BFD),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  child: const Text(
                    "OK",
                    style: TextStyle(color: Colors.white),
                  ),
                ),
              ],
            ),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text("Gagal mengirim pengaduan: $e")));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FE),
      body: Scrollbar(
        controller: _scrollController,
        thumbVisibility: true,
        thickness: 8,
        radius: const Radius.circular(10),
        child: SingleChildScrollView(
          controller: _scrollController,
          child: Column(
            children: [
              // Blue Header
              Container(
                width: double.infinity,
                padding: const EdgeInsets.fromLTRB(20, 60, 20, 40),
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [Color(0xFF246BFD), Color(0xFF0044CC)],
                  ),
                  borderRadius: BorderRadius.vertical(
                    bottom: Radius.circular(40),
                  ),
                ),
                child: Column(
                  children: [
                    Text(
                      "Customer Service",
                      style: GoogleFonts.outfit(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 25),
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.15),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.chat_bubble_outline_rounded,
                        color: Colors.white,
                        size: 40,
                      ),
                    ),
                    const SizedBox(height: 20),
                    Text(
                      "Kami Siap Membantu",
                      style: GoogleFonts.outfit(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      "Layanan pelanggan 24/7",
                      style: GoogleFonts.outfit(
                        color: Colors.white70,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              ),

              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    // WhatsApp Button
                    InkWell(
                      onTap: _launchWhatsApp,
                      borderRadius: BorderRadius.circular(20),
                      child: Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: const Color(0xFF00C853),
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF00C853).withValues(alpha: 0.2),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.chat_bubble_outline,
                              color: Colors.white,
                              size: 30,
                            ),
                            const SizedBox(width: 15),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    "Chat via WhatsApp",
                                    style: GoogleFonts.outfit(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 16,
                                    ),
                                  ),
                                  Text(
                                    "Respon cepat & langsung",
                                    style: GoogleFonts.outfit(
                                      color: Colors.white70,
                                      fontSize: 13,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const Icon(
                              Icons.chevron_right_rounded,
                              color: Colors.white,
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 15),
                    // Phone Button
                    InkWell(
                      onTap: _launchPhone,
                      borderRadius: BorderRadius.circular(20),
                      child: Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: Colors.grey.shade200),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.02),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF0F5FF),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Icon(
                                Icons.phone_in_talk_outlined,
                                color: Color(0xFF246BFD),
                                size: 24,
                              ),
                            ),
                            const SizedBox(width: 15),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    "Telepon Call Center",
                                    style: GoogleFonts.outfit(
                                      color: Colors.black87,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 16,
                                    ),
                                  ),
                                  Text(
                                    "Layanan darurat 24 jam",
                                    style: GoogleFonts.outfit(
                                      color: Colors.grey,
                                      fontSize: 13,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const Icon(
                              Icons.chevron_right_rounded,
                              color: Colors.grey,
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 30),

                    // Form Pengaduan
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.03),
                            blurRadius: 20,
                            offset: const Offset(0, 10),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            "Form Pengaduan",
                            style: GoogleFonts.outfit(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Colors.black87,
                            ),
                          ),
                          const SizedBox(height: 20),
                          Text(
                            "Kategori Masalah",
                            style: GoogleFonts.outfit(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: Colors.grey.shade700,
                            ),
                          ),
                          const SizedBox(height: 8),
                          _isLoadingCategories
                              ? const LinearProgressIndicator()
                              : DropdownButtonFormField<String>(
                                  initialValue: _selectedCategory,
                                  decoration: InputDecoration(
                                    filled: true,
                                    fillColor: Colors.grey.shade50,
                                    contentPadding: const EdgeInsets.symmetric(
                                      horizontal: 16,
                                      vertical: 12,
                                    ),
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: BorderSide(
                                        color: Colors.grey.shade200,
                                      ),
                                    ),
                                    enabledBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      borderSide: BorderSide(
                                        color: Colors.grey.shade200,
                                      ),
                                    ),
                                  ),
                                  hint: Text(
                                    "Pilih kategori...",
                                    style: GoogleFonts.outfit(fontSize: 14),
                                  ),
                                  items: _categories.map((e) {
                                    String name = e['nama_kategori'].toString();
                                    return DropdownMenuItem(
                                      value: name,
                                      child: Text(
                                        name,
                                        style: GoogleFonts.outfit(fontSize: 14),
                                      ),
                                    );
                                  }).toList(),
                                  onChanged: (v) =>
                                      setState(() => _selectedCategory = v),
                                ),
                          const SizedBox(height: 20),
                          Text(
                            "Deskripsi Masalah",
                            style: GoogleFonts.outfit(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: Colors.grey.shade700,
                            ),
                          ),
                          const SizedBox(height: 8),
                          TextField(
                            controller: _messageController,
                            maxLines: 4,
                            style: GoogleFonts.outfit(fontSize: 14),
                            decoration: InputDecoration(
                              hintText:
                                  "Jelaskan masalah Anda secara detail...",
                              filled: true,
                              fillColor: Colors.grey.shade50,
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide(
                                  color: Colors.grey.shade200,
                                ),
                              ),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide(
                                  color: Colors.grey.shade200,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 20),
                          // Tips Box inside form
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF0F7FF),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: RichText(
                              text: TextSpan(
                                style: GoogleFonts.outfit(
                                  fontSize: 12,
                                  color: Colors.black87,
                                  height: 1.4,
                                ),
                                children: [
                                  TextSpan(
                                    text: "Tips: ",
                                    style: GoogleFonts.outfit(
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const TextSpan(
                                    text:
                                        "Sertakan informasi seperti waktu kejadian dan langkah yang sudah Anda coba.",
                                  ),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 25),
                          SizedBox(
                            width: double.infinity,
                            height: 50,
                            child: ElevatedButton(
                              onPressed: _submitComplaint,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF246BFD),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                elevation: 0,
                              ),
                              child: Text(
                                "Kirim Pengaduan",
                                style: GoogleFonts.outfit(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 35),

                    // FAQ Section
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.03),
                            blurRadius: 20,
                            offset: const Offset(0, 10),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            "Pertanyaan Umum (FAQ)",
                            style: GoogleFonts.outfit(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Colors.black87,
                            ),
                          ),
                          const SizedBox(height: 20),
                          if (_isLoadingFaqs)
                            const Center(child: Padding(
                              padding: EdgeInsets.all(20.0),
                              child: CircularProgressIndicator(),
                            ))
                          else if (_faqs.isEmpty)
                            const Center(child: Text("Belum ada FAQ tersedia."))
                          else
                            ..._faqs.map(
                              (faq) => _buildFAQItem(
                                faq['question'] ?? faq['pertanyaan'] ?? 'Tanpa Pertanyaan',
                                faq['answer'] ?? faq['jawaban'] ?? 'Tanpa Jawaban',
                              ),
                            ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFAQItem(String question, String answer) {
    return Container(
      margin: const EdgeInsets.only(bottom: 15),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade100),
      ),
      child: Theme(
        data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
        child: ExpansionTile(
          title: Text(
            question,
            style: GoogleFonts.outfit(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: Colors.black87,
            ),
          ),
          iconColor: Colors.grey,
          collapsedIconColor: Colors.grey,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: Text(
                answer,
                style: GoogleFonts.outfit(
                  fontSize: 13,
                  color: Colors.grey.shade600,
                  height: 1.5,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
