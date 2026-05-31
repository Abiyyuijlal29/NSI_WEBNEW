import 'package:flutter/material.dart';
import 'pages/home_page.dart';
import 'pages/billing_page.dart';
import 'pages/package_page.dart';
import 'pages/cs_page.dart';
import 'pages/profile_page.dart';
import 'pages/login_page.dart';

import 'package:supabase_flutter/supabase_flutter.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Supabase.initialize(
    url: 'https://tjbgohixjcduwmiilrmn.supabase.co',
    anonKey:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqYmdvaGl4amNkdXdtaWlscm1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MDkxMDQsImV4cCI6MjA5MzQ4NTEwNH0.8DjBKebfsVRaueekmwImYORVJ4YtYDbDPG8LwrwTXs0',
  );

  runApp(const NetSatuInternewsApp());
}

class NetSatuInternewsApp extends StatelessWidget {
  const NetSatuInternewsApp({super.key});

  @override
  Widget build(BuildContext context) {
    // Cek apakah ada session yang aktif (auto-login)
    final session = Supabase.instance.client.auth.currentSession;

    return MaterialApp(
      title: 'Net Satu Internews',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primaryColor: const Color(0xFF246BFD),
        scaffoldBackgroundColor: const Color(0xFFF8F9FA),
        fontFamily: 'sans-serif',
      ),
      // Jika ada session, langsung ke Home (MainNavigation), jika tidak ke Login
      home: session != null ? const MainNavigation() : const LoginPage(),
    );
  }
}

class MainNavigation extends StatefulWidget {
  const MainNavigation({super.key});

  static MainNavigationState? of(BuildContext context) =>
      context.findAncestorStateOfType<MainNavigationState>();

  @override
  State<MainNavigation> createState() => MainNavigationState();
}

class MainNavigationState extends State<MainNavigation> {
  int _selectedIndex = 2; // Default ke Home sesuai gambar
  bool _autoOpenPayment = false;

  void changeIndex(int index, {bool openPayment = false}) {
    setState(() {
      _selectedIndex = index;
      _autoOpenPayment = openPayment;
    });
  }

  @override
  Widget build(BuildContext context) {
    final List<Widget> pages = [
      BillingPage(key: UniqueKey(), autoOpenPayment: _autoOpenPayment),
      PackagePage(key: UniqueKey()),
      HomePage(key: UniqueKey()),
      CSPage(key: UniqueKey()),
      ProfilePage(key: UniqueKey()),
    ];

    return Scaffold(
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 300),
        transitionBuilder: (Widget child, Animation<double> animation) {
          return FadeTransition(opacity: animation, child: child);
        },
        child: pages[_selectedIndex],
      ),
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        currentIndex: _selectedIndex,
        selectedItemColor: const Color(0xFF246BFD),
        unselectedItemColor: Colors.grey,
        selectedFontSize: 12,
        unselectedFontSize: 12,
        onTap: (index) => changeIndex(index),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.account_balance_wallet_outlined),
            label: 'Billing',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.trending_up),
            label: 'Package',
          ),
          BottomNavigationBarItem(
            icon: CircleAvatar(
              backgroundColor: Color(0xFF246BFD),
              child: Icon(Icons.home, color: Colors.white),
            ),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.headset_mic_outlined),
            label: 'CS',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_outline),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}
