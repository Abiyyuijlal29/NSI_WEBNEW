import 'package:flutter/material.dart';

class LoadingLogo extends StatelessWidget {
  const LoadingLogo({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(15),
            decoration: BoxDecoration(
              color: const Color(0xFF246BFD).withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Icon(
              Icons.wifi,
              color: Color(0xFF246BFD),
              size: 50,
            ),
          ),
          const SizedBox(height: 20),
          const CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF246BFD)),
          ),
          const SizedBox(height: 10),
          const Text(
            "Memuat data...",
            style: TextStyle(
              color: Color(0xFF246BFD),
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}
