<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Event;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        if (Event::count() > 0) {
            return;
        }

        Event::create([
            'title' => 'Pembukaan Resmi RS LIVASYA FUTSAL CUP 2026 🏆',
            'content' => 'Turnamen futsal bergengsi RS LIVASYA CUP 2026 resmi dibuka hari ini di Rama Futsall Kadipaten! Mari dukung tim favorit kalian dan jadilah bagian dari euforia futsal terbesar musim ini. Jangan lupa jaga sportifitas dan kebersamaan! 🔥⚽ #RSLivasyaCup2026 #FutsalMajalengka #RamaFutsall',
            'image_url' => 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1000&q=80',
            'author_name' => 'Panitia Turnamen Livasya',
            'likes_count' => 142,
            'comments_count' => 28,
            'shares_count' => 15,
            'is_published' => true,
        ]);

        Event::create([
            'title' => 'Match Highlight: Livasya FC vs Majalengka United ⚽',
            'content' => 'Pertandingan sengit sore tadi berakhir imbang 2-2 antara Livasya FC dan Majalengka United! Gol penyeimbang diciptakan di menit-menit akhir babak kedua. Simak statistik lengkap dan cuplikan pertandingannya di tab Livescore!',
            'image_url' => 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1000&q=80',
            'author_name' => 'Media Officer Livasya',
            'likes_count' => 98,
            'comments_count' => 14,
            'shares_count' => 7,
            'is_published' => true,
        ]);

        Event::create([
            'title' => 'Syarat & Ketentuan Pendaftaran Sponsor 📝',
            'content' => 'RS LIVASYA FUTSAL CUP 2026 membuka kesempatan bagi brand dan produk yang ingin menjadi sponsor resmi turnamen. Hubungi panitia melalui tombol WhatsApp di menu About untuk informasi media kit dan paket sponsorship menarik!',
            'image_url' => 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=80',
            'author_name' => 'Humas RS Livasya',
            'likes_count' => 64,
            'comments_count' => 6,
            'shares_count' => 12,
            'is_published' => true,
        ]);
    }
}
