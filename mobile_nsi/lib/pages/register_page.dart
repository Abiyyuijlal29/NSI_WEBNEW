import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:math';
import 'package:flutter/services.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  String? _selectedPackage;
  List<Map<String, dynamic>> _packageList = [];
  bool _isLoadingPackages = true;

  @override
  void initState() {
    super.initState();
    _fetchPackages();
  }

  Future<void> _fetchPackages() async {
    try {
      final response = await Supabase.instance.client
          .from('paket')
          .select()
          .order('harga', ascending: true);
      if (mounted) {
        setState(() {
          _packageList = List<Map<String, dynamic>>.from(response);
          _isLoadingPackages = false;
        });
      }
    } catch (e) {
      debugPrint("Error fetching packages: $e");
      if (mounted) {
        setState(() {
          _isLoadingPackages = false;
        });
      }
    }
  }

  String _formatNumber(int number) {
    return number.toString().replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]}.',
    );
  }

  String _generatePasskey() {
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const allChars = lower + upper + numbers;

    final random = Random();
    String passkey = '';

    // Pastikan ada setidaknya 1 huruf kecil, 1 huruf besar, dan 1 angka
    passkey += lower[random.nextInt(lower.length)];
    passkey += upper[random.nextInt(upper.length)];
    passkey += numbers[random.nextInt(numbers.length)];

    // Sisa 5 karakter acak dari gabungan ketiganya (total 8 digit)
    for (int i = 0; i < 5; i++) {
      passkey += allChars[random.nextInt(allChars.length)];
    }

    // Acak posisinya agar polanya tidak mudah ditebak
    List<String> passkeyList = passkey.split('');
    passkeyList.shuffle(random);
    return passkeyList.join('');
  }

  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();
  final _nikController = TextEditingController();

  XFile? _ktpPhoto;
  Uint8List? _ktpBytes;
  final ImagePicker _picker = ImagePicker();
  bool _isAgreed = false;
  bool _isLoading = false;
  bool _isSubmitted = false;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    _nikController.dispose();
    super.dispose();
  }

  Future<void> _register() async {
    setState(() => _isSubmitted = true);

    if (_nameController.text.trim().isEmpty ||
        _emailController.text.trim().isEmpty ||
        _phoneController.text.trim().isEmpty ||
        _addressController.text.trim().isEmpty ||
        _nikController.text.trim().isEmpty ||
        _selectedPackage == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Mohon lengkapi semua data yang wajib diisi"),
        ),
      );
      return;
    }

    if (!_emailController.text.trim().endsWith('@gmail.com')) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Email wajib menggunakan @gmail.com")),
      );
      return;
    }

    if (_nikController.text.trim().length != 16) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("NIK tidak lebih dan tidak kurang dari 16"),
        ),
      );
      return;
    }

    if (_ktpPhoto == null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text("Foto KTP wajib diunggah")));
      return;
    }

    if (!_isAgreed) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Anda harus menyetujui Syarat & Ketentuan"),
        ),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      // 0. Cek jika semua data sama persis
      final allMatchCheck = await Supabase.instance.client
          .from('calon_pelanggan')
          .select('id')
          .eq('nama_lengkap', _nameController.text.trim())
          .eq('email', _emailController.text.trim())
          .eq('no_hp', _phoneController.text.trim())
          .eq('nik', _nikController.text.trim())
          .limit(1)
          .maybeSingle();

      if (allMatchCheck != null) {
        _showErrorDialog("Data Sudah Terdaftar", "semua data diri sudah terpakai, mohon masukkan data diri yang berbeda untuk berlangganan lagi");
        setState(() => _isLoading = false);
        return;
      }

      // 1. Cek duplikasi data secara berurutan
      final nameCheck = await Supabase.instance.client
          .from('calon_pelanggan')
          .select('nama_lengkap')
          .eq('nama_lengkap', _nameController.text.trim())
          .maybeSingle();
      if (nameCheck != null) {
        _showErrorDialog("Nama sudah terdaftar", "Nama yang Anda masukkan sudah tercantum di dalam sistem.");
        setState(() => _isLoading = false);
        return;
      }

      final emailCheck = await Supabase.instance.client
          .from('calon_pelanggan')
          .select('email')
          .eq('email', _emailController.text.trim())
          .maybeSingle();
      if (emailCheck != null) {
        _showErrorDialog("Email sudah terdaftar", "Email yang Anda masukkan sudah tercantum di dalam sistem.");
        setState(() => _isLoading = false);
        return;
      }

      final phoneCheck = await Supabase.instance.client
          .from('calon_pelanggan')
          .select('no_hp')
          .eq('no_hp', _phoneController.text.trim())
          .maybeSingle();
      if (phoneCheck != null) {
        _showErrorDialog("Nomor Handphone sudah terdaftar", "Nomor handphone yang Anda masukkan sudah tercantum di dalam sistem.");
        setState(() => _isLoading = false);
        return;
      }

      final nikCheck = await Supabase.instance.client
          .from('calon_pelanggan')
          .select('nik')
          .eq('nik', _nikController.text.trim())
          .maybeSingle();
      if (nikCheck != null) {
        _showErrorDialog("NIK sudah terdaftar", "NIK yang Anda masukkan sudah tercantum di dalam sistem.");
        setState(() => _isLoading = false);
        return;
      }

      // 1. Upload KTP ke Storage
      String? ktpUrl;
      try {
        if (_ktpBytes != null) {
          final fileExt = _ktpPhoto!.name.split('.').last;
          // Buat ID unik menggunakan nomor HP dan timestamp
          final uniqueId =
              "${_phoneController.text.trim()}_${DateTime.now().millisecondsSinceEpoch}";
          final fileName = 'ktp_$uniqueId.$fileExt';

          await Supabase.instance.client.storage
              .from('avatars')
              .uploadBinary('ktp/$fileName', _ktpBytes!);

          ktpUrl = Supabase.instance.client.storage
              .from('avatars')
              .getPublicUrl('ktp/$fileName');
        }
      } catch (e) {
        debugPrint('Error upload KTP: $e');
      }

      // 2. Generate Passkey otomatis
      final generatedPasskey = _generatePasskey();

      // 3. Simpan data calon pelanggan ke tabel calon_pelanggan
      await Supabase.instance.client.from('calon_pelanggan').insert({
        'nama_lengkap': _nameController.text.trim(),
        'email': _emailController.text.trim(),
        'no_hp': _phoneController.text.trim(),
        'alamat_lengkap': _addressController.text.trim(),
        'nik': _nikController.text.trim(),
        'foto_ktp': ktpUrl,
        'paket_berlangganan':
            _selectedPackage, // Pastikan nama kolom ini sama dengan di Supabase
        'password': generatedPasskey,
        'created_at': DateTime.now().toIso8601String(),
      });

      if (mounted) {
        _showSuccessDialog();
      }
    } catch (error) {
      debugPrint('Error Insert DB: $error');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text("Gagal menyimpan data: $error"),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text("Pendaftaran Pengajuan Berlangganan Berhasil"),
        content: const Text(
          "anda sudah melakukan pendaftaran berlangganan wifi NSI,silahkan tunggu konfirmasi dari pihak kami melalu Whatsapp",
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context); // close dialog
              Navigator.pop(context); // back to login
            },
            child: const Text("OK"),
          ),
        ],
      ),
    );
  }

  void _showErrorDialog(String title, String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text(title, style: const TextStyle(color: Colors.red)),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("OK", style: TextStyle(color: Color(0xFF246BFD), fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.white,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          "Daftar Berlangganan",
          style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(25),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Center(
              child: Text(
                "Lengkapi data diri Anda",
                style: TextStyle(color: Colors.grey),
              ),
            ),
            const SizedBox(height: 30),

            const Text(
              "Paket yang akan Anda pilih",
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            _isLoadingPackages
                ? const Center(child: CircularProgressIndicator())
                : DropdownButtonFormField<String>(
                    initialValue: _selectedPackage,
                    isExpanded: true,
                    decoration: _inputDecoration(
                      "Pilih Paket",
                      errorText: _isSubmitted && _selectedPackage == null
                          ? "wajib diisi"
                          : null,
                    ),
                    items: _packageList.map((paket) {
                      final namaPaket = paket['nama_paket'].toString();
                      final harga = _formatNumber(
                        (paket['harga'] as num).toInt(),
                      );
                      final displayName = "$namaPaket ($harga)";

                      return DropdownMenuItem<String>(
                        value:
                            namaPaket, // Simpan nama paketnya ke _selectedPackage
                        child: Text(displayName),
                      );
                    }).toList(),
                    onChanged: (newValue) {
                      setState(() {
                        _selectedPackage = newValue;
                      });
                    },
                  ),
            const SizedBox(height: 20),

            _buildInputField(
              "Nama Lengkap",
              "Masukkan nama lengkap",
              _nameController,
            ),
            _buildInputField("Email", "contoh@email.com", _emailController),
            _buildInputField("No. Handphone", "08123456789", _phoneController),
            _buildInputField(
              "Alamat Lengkap",
              "Jl. Contoh No. 123, Jakarta",
              _addressController,
              maxLines: 3,
            ),

            _buildInputField("NIK", "Masukkan NIK KTP Anda", _nikController),

            const Text(
              "Foto KTP",
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            GestureDetector(
              onTap: () async {
                final XFile? image = await _picker.pickImage(
                  source: ImageSource.gallery,
                  imageQuality: 70,
                );
                if (image != null) {
                  final bytes = await image.readAsBytes();
                  setState(() {
                    _ktpPhoto = image;
                    _ktpBytes = bytes;
                  });
                }
              },
              child: Container(
                width: double.infinity,
                height: 180,
                decoration: BoxDecoration(
                  color: Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(15),
                  border: Border.all(color: Colors.grey.shade300, width: 1),
                ),
                child: _ktpBytes != null
                    ? ClipRRect(
                        borderRadius: BorderRadius.circular(15),
                        child: Image.memory(
                          _ktpBytes!,
                          fit: BoxFit.cover,
                          width: double.infinity,
                        ),
                      )
                    : const Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.camera_alt_outlined,
                            color: Colors.grey,
                            size: 40,
                          ),
                          SizedBox(height: 8),
                          Text(
                            "Tap untuk memilih foto KTP",
                            style: TextStyle(color: Colors.grey),
                          ),
                        ],
                      ),
              ),
            ),
            if (_isSubmitted && _ktpPhoto == null)
              const Padding(
                padding: EdgeInsets.only(top: 8.0, left: 15.0),
                child: Text(
                  "wajib diisi",
                  style: TextStyle(color: Colors.red, fontSize: 12),
                ),
              ),
            const SizedBox(height: 20),

            Row(
              children: [
                Checkbox(
                  value: _isAgreed,
                  onChanged: (v) => setState(() => _isAgreed = v ?? false),
                  activeColor: const Color(0xFF246BFD),
                ),
                Expanded(
                  child: RichText(
                    text: const TextSpan(
                      text: "Saya setuju dengan ",
                      style: TextStyle(color: Colors.black, fontSize: 12),
                      children: [
                        TextSpan(
                          text: "Syarat & Ketentuan ",
                          style: TextStyle(color: Color(0xFF246BFD)),
                        ),
                        TextSpan(text: "dan "),
                        TextSpan(
                          text: "Kebijakan Privasi ",
                          style: TextStyle(color: Color(0xFF246BFD)),
                        ),
                        TextSpan(text: "Net Satu Internews"),
                      ],
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 30),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _register,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF246BFD),
                  padding: const EdgeInsets.symmetric(vertical: 15),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(15),
                  ),
                ),
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2,
                        ),
                      )
                    : const Text(
                        "Daftar Sekarang",
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
              ),
            ),
            const SizedBox(height: 20),
            Center(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text("Sudah punya akun? "),
                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: const Text(
                      "Masuk",
                      style: TextStyle(
                        color: Color(0xFF246BFD),
                        fontWeight: FontWeight.bold,
                      ),
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

  Widget _buildInputField(
    String label,
    String hint,
    TextEditingController controller, {
    int maxLines = 1,
  }) {
    String? finalErrorText;
    if (_isSubmitted) {
      if (controller.text.trim().isEmpty) {
        finalErrorText = "wajib diisi";
      } else if (label == "Email" &&
          !controller.text.trim().endsWith("@gmail.com")) {
        finalErrorText = "Email wajib menggunakan @gmail.com";
      } else if (label == "NIK" && controller.text.trim().length != 16) {
        finalErrorText = "NIK tidak lebih dan tidak kurang dari 16";
      }
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          maxLines: maxLines,
          keyboardType: label == "NIK" || label == "No. Handphone"
              ? TextInputType.number
              : null,
          inputFormatters: label == "NIK"
              ? [
                  DigitValidationFormatter(
                    onInvalidInput: () {
                      ScaffoldMessenger.of(context).clearSnackBars();
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text("NIK hanya boleh berisi angka!"),
                          duration: Duration(milliseconds: 800),
                        ),
                      );
                    },
                  ),
                  LengthLimitingTextInputFormatter(16),
                ]
              : label == "No. Handphone"
                  ? [
                      FilteringTextInputFormatter.digitsOnly,
                    ]
                  : null,
          onChanged: (val) {
            setState(() {});
          },
          decoration: _inputDecoration(hint, errorText: finalErrorText),
        ),
        const SizedBox(height: 20),
      ],
    );
  }

  InputDecoration _inputDecoration(
    String hint, {
    bool isPassword = false,
    VoidCallback? onToggle,
    bool visible = false,
    String? errorText,
  }) {
    return InputDecoration(
      hintText: hint,
      errorText: errorText,
      filled: true,
      fillColor: Colors.grey.shade100,
      suffixIcon: isPassword
          ? IconButton(
              icon: Icon(
                visible
                  ? Icons.visibility_off_outlined
                  : Icons.visibility_outlined,
              ),
              onPressed: onToggle,
            )
          : null,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(15),
        borderSide: BorderSide.none,
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
    );
  }
}

class DigitValidationFormatter extends TextInputFormatter {
  final VoidCallback onInvalidInput;

  DigitValidationFormatter({required this.onInvalidInput});

  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    if (RegExp(r'\D').hasMatch(newValue.text)) {
      onInvalidInput();
      final cleanText = newValue.text.replaceAll(RegExp(r'\D'), '');
      final selectionIndex = min(cleanText.length, newValue.selection.end);
      return TextEditingValue(
        text: cleanText,
        selection: TextSelection.collapsed(offset: selectionIndex),
      );
    }
    return newValue;
  }
}
