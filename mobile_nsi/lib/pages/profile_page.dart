import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'login_page.dart';
import '../widgets/loading_logo.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  final ImagePicker _picker = ImagePicker();
  String? _imageUrl; // URL foto dari Supabase
  String _name = "User";
  String _email = "";
  String _phone = "";
  String _address = "";
  bool _isLoading = true;
  bool _isUploading = false; // Loading saat upload

  @override
  void initState() {
    super.initState();
    _fetchUserData();
  }

  Future<void> _fetchUserData() async {
    try {
      final user = Supabase.instance.client.auth.currentUser;
      if (user != null) {
        final data = await Supabase.instance.client
            .from('profile_customer')
            .select('*')
            .eq('id', user.id)
            .single();

        if (mounted) {
          setState(() {
            _name = data['nama_lengkap'] ?? "User";
            _email = data['email'] ?? "";
            _phone = data['no_hp'] ?? "";
            _address = data['alamat_lengkap'] ?? "";
            _imageUrl = data['foto_profil']; // Ambil URL foto
            _isLoading = false;
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _pickImage() async {
    final XFile? image = await _picker.pickImage(source: ImageSource.gallery);
    if (image != null) {
      _uploadImage(image);
    }
  }

  Future<void> _uploadImage(XFile imageFile) async {
    setState(() => _isUploading = true);
    try {
      final user = Supabase.instance.client.auth.currentUser;
      if (user == null) return;

      final bytes = await imageFile.readAsBytes();
      final fileExt = imageFile.path.split('.').last;
      final fileName = '${DateTime.now().millisecondsSinceEpoch}.$fileExt';
      final filePath = '${user.id}/$fileName';

      // 1. Upload ke Storage (Bucket: 'avatars')
      await Supabase.instance.client.storage.from('avatars').uploadBinary(
            filePath,
            bytes,
            fileOptions: const FileOptions(cacheControl: '3600', upsert: true),
          );

      // 2. Ambil Public URL
      final String publicUrl = Supabase.instance.client.storage
          .from('avatars')
          .getPublicUrl(filePath);

      // 3. Simpan URL ke Tabel profile_customer
      await Supabase.instance.client
          .from('profile_customer')
          .update({'foto_profil': publicUrl}).eq('id', user.id);

      if (mounted) {
        setState(() {
          _imageUrl = publicUrl;
          _isUploading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Foto profil berhasil diperbarui")),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isUploading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Gagal upload foto: $e"), backgroundColor: Colors.red),
        );
      }
    }
  }

  void _showLogoutDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text(
          "Keluar Aplikasi",
          style: GoogleFonts.outfit(fontWeight: FontWeight.bold),
        ),
        content: Text(
          "Apakah Anda yakin ingin keluar dari aplikasi?",
          style: GoogleFonts.outfit(),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text("Batal", style: GoogleFonts.outfit(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () async {
              await Supabase.instance.client.auth.signOut();
              if (context.mounted) {
                Navigator.pushAndRemoveUntil(
                  context,
                  PageRouteBuilder(
                    pageBuilder: (context, animation, secondaryAnimation) => const LoginPage(),
                    transitionsBuilder: (context, animation, secondaryAnimation, child) {
                      return FadeTransition(opacity: animation, child: child);
                    },
                    transitionDuration: const Duration(milliseconds: 400),
                  ),
                  (route) => false,
                );
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            child: Text(
              "Keluar",
              style: GoogleFonts.outfit(color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }

  void _showEditProfile() {
    final nameController = TextEditingController(text: _name);
    final emailController = TextEditingController(text: _email);
    final phoneController = TextEditingController(text: _phone);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
        ),
        padding: EdgeInsets.fromLTRB(
          20,
          20,
          20,
          MediaQuery.of(context).viewInsets.bottom + 20,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
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
            Text(
              "Edit Profil",
              style: GoogleFonts.outfit(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 20),
            _buildTextField("Nama Lengkap", nameController),
            const SizedBox(height: 15),
            _buildTextField("Email", emailController),
            const SizedBox(height: 15),
            _buildTextField("No. Handphone", phoneController),
            const SizedBox(height: 25),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: () async {
                  try {
                    final user = Supabase.instance.client.auth.currentUser;
                    if (user != null) {
                      await Supabase.instance.client
                          .from('profile_customer')
                          .update({
                        'nama_lengkap': nameController.text,
                        'email': emailController.text,
                        'no_hp': phoneController.text,
                      }).eq('id', user.id);

                      setState(() {
                        _name = nameController.text;
                        _email = emailController.text;
                        _phone = phoneController.text;
                      });

                      if (context.mounted) {
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text("Profil berhasil diperbarui")),
                        );
                      }
                    }
                  } catch (e) {
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text("Gagal memperbarui profil: $e"), backgroundColor: Colors.red),
                      );
                    }
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF246BFD),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: Text(
                  "Simpan Perubahan",
                  style: GoogleFonts.outfit(
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

  void _showChangePassword() {
    final oldPasswordController = TextEditingController();
    final newPasswordController = TextEditingController();
    final confirmPasswordController = TextEditingController();
    bool isProcessing = false;
    bool isObscureOld = true;
    bool isObscureNew = true;
    bool isObscureConfirm = true;

    void showErrorDialog(String message) {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Text("Gagal"),
          content: Text(message),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text("OK"),
            ),
          ],
        ),
      );
    }

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) => Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
          ),
          padding: EdgeInsets.fromLTRB(
            20,
            20,
            20,
            MediaQuery.of(context).viewInsets.bottom + 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
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
              Text(
                "Ubah Password",
                style: GoogleFonts.outfit(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 20),
              _buildTextField(
                "Password Lama",
                oldPasswordController,
                isPassword: true,
                obscureText: isObscureOld,
                onToggle: () => setModalState(() => isObscureOld = !isObscureOld),
              ),
              const SizedBox(height: 15),
              _buildTextField(
                "Password Baru",
                newPasswordController,
                isPassword: true,
                obscureText: isObscureNew,
                onToggle: () => setModalState(() => isObscureNew = !isObscureNew),
              ),
              const SizedBox(height: 15),
              _buildTextField(
                "Konfirmasi Password Baru",
                confirmPasswordController,
                isPassword: true,
                obscureText: isObscureConfirm,
                onToggle: () => setModalState(() => isObscureConfirm = !isObscureConfirm),
              ),
              const SizedBox(height: 25),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: isProcessing
                      ? null
                      : () async {
                          if (oldPasswordController.text.isEmpty ||
                              newPasswordController.text.isEmpty ||
                              confirmPasswordController.text.isEmpty) {
                            showErrorDialog("Semua field harus diisi");
                            return;
                          }

                          if (newPasswordController.text !=
                              confirmPasswordController.text) {
                            showErrorDialog("Konfirmasi password baru tidak cocok");
                            confirmPasswordController.clear();
                            return;
                          }

                          setModalState(() => isProcessing = true);

                          try {
                            final user = Supabase.instance.client.auth.currentUser;
                            if (user?.email == null) throw "Email tidak ditemukan";

                            // 1. Verifikasi password lama
                            await Supabase.instance.client.auth.signInWithPassword(
                              email: user!.email!,
                              password: oldPasswordController.text,
                            );

                            // 2. Jika lolos, update ke password baru
                            await Supabase.instance.client.auth.updateUser(
                              UserAttributes(password: newPasswordController.text),
                            );

                            if (context.mounted) {
                              Navigator.pop(context);
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text("Password berhasil diubah"),
                                  backgroundColor: Colors.green,
                                ),
                              );
                            }
                          } catch (e) {
                            if (mounted) {
                              showErrorDialog("Password lama salah atau terjadi kesalahan pada sistem");
                              oldPasswordController.clear();
                            }
                          } finally {
                            if (mounted) setModalState(() => isProcessing = false);
                          }
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF246BFD),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: isProcessing
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : Text(
                          "Ubah Password",
                          style: GoogleFonts.outfit(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTextField(
    String label,
    TextEditingController controller, {
    bool isPassword = false,
    bool obscureText = false,
    VoidCallback? onToggle,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.outfit(fontSize: 13, color: Colors.grey.shade700),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          obscureText: isPassword ? obscureText : false,
          decoration: InputDecoration(
            filled: true,
            fillColor: Colors.grey.shade50,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: Colors.grey.shade200),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: Colors.grey.shade200),
            ),
            suffixIcon: isPassword
                ? IconButton(
                    icon: Icon(
                      obscureText ? Icons.visibility_off : Icons.visibility,
                      color: Colors.grey,
                    ),
                    onPressed: onToggle,
                  )
                : null,
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 12,
            ),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const LoadingLogo();
    }
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FE),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Header
            Stack(
              clipBehavior: Clip.none,
              alignment: Alignment.center,
              children: [
                Container(
                  height: 220,
                  width: double.infinity,
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
                  child: Padding(
                    padding: const EdgeInsets.only(top: 60),
                    child: Align(
                      alignment: Alignment.topCenter,
                      child: Text(
                        "Profil Saya",
                        style: GoogleFonts.outfit(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ),
                Positioned(
                  bottom: -50,
                  child: Column(
                    children: [
                      Stack(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(4),
                            decoration: const BoxDecoration(
                              color: Colors.white,
                              shape: BoxShape.circle,
                            ),
                            child: CircleAvatar(
                              radius: 55,
                              backgroundColor: Colors.grey.shade200,
                              backgroundImage: _imageUrl != null
                                  ? NetworkImage(_imageUrl!)
                                  : null,
                              child: _imageUrl == null
                                  ? const Icon(
                                      Icons.person,
                                      size: 60,
                                      color: Colors.grey,
                                    )
                                  : null,
                            ),
                          ),
                          if (_isUploading)
                            Positioned.fill(
                              child: Container(
                                decoration: BoxDecoration(
                                  color: Colors.black.withValues(alpha: 0.3),
                                  shape: BoxShape.circle,
                                ),
                                child: const Center(
                                  child: CircularProgressIndicator(
                                    color: Colors.white,
                                  ),
                                ),
                              ),
                            ),
                          Positioned(
                            bottom: 0,
                            right: 0,
                            child: GestureDetector(
                              onTap: _pickImage,
                              child: Container(
                                padding: const EdgeInsets.all(8),
                                decoration: const BoxDecoration(
                                  color: Color(0xFF246BFD),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(
                                  Icons.camera_alt,
                                  color: Colors.white,
                                  size: 20,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text(
                        _name,
                        style: GoogleFonts.outfit(
                          fontWeight: FontWeight.bold,
                          fontSize: 22,
                        ),
                      ),
                      Text(
                        "ID: #LUM-2026-001",
                        style: GoogleFonts.outfit(
                          color: Colors.grey,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 120),

            // Profile Sections
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        "Informasi Akun",
                        style: GoogleFonts.outfit(
                          fontWeight: FontWeight.bold,
                          fontSize: 17,
                        ),
                      ),
                      TextButton(
                        onPressed: _showEditProfile,
                        child: Text(
                          "Edit Profil",
                          style: GoogleFonts.outfit(
                            color: const Color(0xFF246BFD),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  _buildProfileCard(),
                  const SizedBox(height: 30),
                  Text(
                    "Keamanan",
                    style: GoogleFonts.outfit(
                      fontWeight: FontWeight.bold,
                      fontSize: 17,
                    ),
                  ),
                  const SizedBox(height: 15),
                  _menuItem(
                    Icons.lock_outline,
                    "Ubah Password",
                    onTap: _showChangePassword,
                  ),
                  const SizedBox(height: 12),
                  _menuItem(
                    Icons.logout_rounded,
                    "Keluar Aplikasi",
                    isDanger: true,
                    onTap: _showLogoutDialog,
                  ),
                  const SizedBox(height: 30),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _statusBox("Terdaftar Sejak", "12 Jan 2025"),
                      _statusBox("Status Akun", "Aktif", isBadge: true),
                    ],
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 15,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          _profileInfoRow(Icons.email_outlined, "Email", _email),
          const Divider(height: 30),
          _profileInfoRow(Icons.phone_outlined, "No. Handphone", _phone),
          const Divider(height: 30),
          _profileInfoRow(Icons.location_on_outlined, "Alamat", _address),
        ],
      ),
    );
  }

  Widget _profileInfoRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: const Color(0xFFF0F5FF),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: const Color(0xFF246BFD), size: 20),
        ),
        const SizedBox(width: 15),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: GoogleFonts.outfit(fontSize: 12, color: Colors.grey),
              ),
              Text(
                value,
                style: GoogleFonts.outfit(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _menuItem(
    IconData icon,
    String title, {
    bool isDanger = false,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: isDanger ? Colors.red.withValues(alpha: 0.05) : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isDanger
                ? Colors.red.withValues(alpha: 0.1)
                : Colors.grey.shade100,
          ),
        ),
        child: Row(
          children: [
            Icon(icon, color: isDanger ? Colors.red : Colors.black87),
            const SizedBox(width: 15),
            Text(
              title,
              style: GoogleFonts.outfit(
                color: isDanger ? Colors.red : Colors.black87,
                fontWeight: FontWeight.w600,
              ),
            ),
            const Spacer(),
            if (!isDanger)
              const Icon(Icons.chevron_right, color: Colors.grey, size: 20),
          ],
        ),
      ),
    );
  }

  Widget _statusBox(String label, String value, {bool isBadge = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.outfit(fontSize: 12, color: Colors.grey),
        ),
        const SizedBox(height: 8),
        isBadge
            ? Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: Colors.green.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  value,
                  style: GoogleFonts.outfit(
                    color: Colors.green,
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
              )
            : Text(
                value,
                style: GoogleFonts.outfit(
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
      ],
    );
  }
}
