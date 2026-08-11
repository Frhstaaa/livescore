<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Public\LivescoreController;
use App\Http\Controllers\Public\MatchDetailController;
use App\Http\Controllers\Public\PlayerController;
use App\Http\Controllers\Public\StandingController;
use App\Http\Controllers\Public\FavoriteController;
use App\Http\Controllers\Public\AboutController;

use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\TeamController;
use App\Http\Controllers\Admin\PlayerController as AdminPlayerController;
use App\Http\Controllers\Admin\MatchController;
use App\Http\Controllers\Admin\LiveControlController;
use App\Http\Controllers\Admin\SponsorController;
use App\Http\Controllers\Admin\CompetitionController;

// Public Routes
Route::get('/', [LivescoreController::class, 'index'])->name('livescore.index');
Route::get('/match/{id}', [MatchDetailController::class, 'show'])->name('match.detail');
Route::get('/players', [PlayerController::class, 'index'])->name('players.index');
Route::get('/standings', [StandingController::class, 'index'])->name('standings.index');
Route::get('/favorites', [FavoriteController::class, 'index'])->name('favorites.index');
Route::get('/about', [AboutController::class, 'index'])->name('about.index');

// Admin Auth Routes
Route::get('/admin/login', [AuthController::class, 'showLogin'])->name('admin.login');
Route::post('/admin/login', [AuthController::class, 'login'])->name('admin.login.submit');
Route::post('/admin/logout', [AuthController::class, 'logout'])->name('admin.logout');

// Protected Admin Routes
Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Competitions (Turnamen & Pengaturan Waktu/Sistem)
    Route::get('/competitions', [CompetitionController::class, 'index'])->name('competitions.index');
    Route::post('/competitions', [CompetitionController::class, 'store'])->name('competitions.store');
    Route::put('/competitions/{id}', [CompetitionController::class, 'update'])->name('competitions.update');
    Route::post('/competitions/{id}/active', [CompetitionController::class, 'setActive'])->name('competitions.active');
    Route::delete('/competitions/{id}', [CompetitionController::class, 'destroy'])->name('competitions.destroy');

    // Teams
    Route::get('/teams', [TeamController::class, 'index'])->name('teams.index');
    Route::post('/teams', [TeamController::class, 'store'])->name('teams.store');
    Route::put('/teams/{id}', [TeamController::class, 'update'])->name('teams.update');
    Route::delete('/teams/{id}', [TeamController::class, 'destroy'])->name('teams.destroy');

    // Players
    Route::get('/players', [AdminPlayerController::class, 'index'])->name('players.index');
    Route::post('/players', [AdminPlayerController::class, 'store'])->name('players.store');
    Route::put('/players/{id}', [AdminPlayerController::class, 'update'])->name('players.update');
    Route::delete('/players/{id}', [AdminPlayerController::class, 'destroy'])->name('players.destroy');

    // Matches
    Route::get('/matches', [MatchController::class, 'index'])->name('matches.index');
    Route::post('/matches', [MatchController::class, 'store'])->name('matches.store');
    Route::delete('/matches/{id}', [MatchController::class, 'destroy'])->name('matches.destroy');

    // Live Control Panel
    Route::get('/live', [LiveControlController::class, 'index'])->name('live.index');
    Route::post('/live/{id}/status', [LiveControlController::class, 'updateStatus'])->name('live.status');
    Route::post('/live/{id}/event', [LiveControlController::class, 'addEvent'])->name('live.event');
    Route::post('/live/{id}/motm', [LiveControlController::class, 'setMotm'])->name('live.motm');

    // Sponsors & About
    Route::get('/sponsors', [SponsorController::class, 'index'])->name('sponsors.index');
    Route::post('/sponsors', [SponsorController::class, 'store'])->name('sponsors.store');
    Route::put('/sponsors/{id}', [SponsorController::class, 'update'])->name('sponsors.update');
    Route::delete('/sponsors/{id}', [SponsorController::class, 'destroy'])->name('sponsors.destroy');
    Route::post('/sponsors/about', [SponsorController::class, 'updateAbout'])->name('sponsors.about');
});
