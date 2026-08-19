<?php

use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\CompetitionController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\LiveControlController;
use App\Http\Controllers\Admin\MatchController;
use App\Http\Controllers\Admin\PlayerController as AdminPlayerController;
use App\Http\Controllers\Admin\SponsorController;
use App\Http\Controllers\Admin\TeamController;
use App\Http\Controllers\Admin\EventController as AdminEventController;
use App\Http\Controllers\Admin\RegistrationController as AdminRegistrationController;
use App\Http\Controllers\Public\RegistrationController as PublicRegistrationController;
use App\Http\Controllers\Public\TeamDraftController;
use App\Http\Controllers\Public\AboutController;
use App\Http\Controllers\Public\EventController as PublicEventController;
use App\Http\Controllers\Public\FavoriteController;
use App\Http\Controllers\Public\LivescoreController;
use App\Http\Controllers\Public\MatchDetailController;
use App\Http\Controllers\Public\PlayerController;
use App\Http\Controllers\Public\StandingController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes (Generous Throttle: 300 req/min for Realtime Live Updates)
|--------------------------------------------------------------------------
*/
Route::middleware(['throttle:300,1'])->group(function () {
    Route::get('/', [LivescoreController::class, 'index'])->name('public.index');
    Route::get('/match/{id}', [MatchDetailController::class, 'show'])->name('public.match.detail');
    Route::get('/players', [PlayerController::class, 'index'])->name('public.players');
    Route::get('/standings', [StandingController::class, 'index'])->name('public.standings');
    Route::get('/favorites', [FavoriteController::class, 'index'])->name('public.favorites');
    Route::get('/events', [PublicEventController::class, 'index'])->name('public.events');
    Route::post('/events/{id}/like', [PublicEventController::class, 'like'])->name('public.events.like');
    Route::get('/about', [AboutController::class, 'index'])->name('public.about');
    Route::get('/api/teams-draft', [TeamDraftController::class, 'getDraftData'])->name('api.teams-draft');
    
    Route::get('/register', [PublicRegistrationController::class, 'index'])->name('public.register');
    Route::post('/register', [PublicRegistrationController::class, 'store'])->name('public.register.store');
});

/*
|--------------------------------------------------------------------------
| Admin Authentication Routes (Protected against Brute-Force: 30 attempts/min)
|--------------------------------------------------------------------------
*/
Route::get('/admin/login', [AuthController::class, 'showLogin'])->name('admin.login');
Route::post('/admin/login', [AuthController::class, 'login'])->middleware('throttle:30,1');
Route::post('/admin/logout', [AuthController::class, 'logout'])->name('admin.logout');

/*
|--------------------------------------------------------------------------
| Admin Protected Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Competitions
    Route::get('/competitions', [CompetitionController::class, 'index'])->name('competitions.index');
    Route::post('/competitions', [CompetitionController::class, 'store'])->name('competitions.store');
    Route::put('/competitions/{id}', [CompetitionController::class, 'update'])->name('competitions.update');
    Route::post('/competitions/{id}/active', [CompetitionController::class, 'setActive'])->name('competitions.active');
    Route::post('/competitions/{id}/sync-teams', [CompetitionController::class, 'syncTeams'])->name('competitions.sync-teams');
    Route::post('/competitions/{id}/toggle-draft-bubble', [CompetitionController::class, 'toggleDraftBubble'])->name('competitions.toggle-draft-bubble');
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
    Route::post('/matches/generate', [MatchController::class, 'generate'])->name('matches.generate');
    Route::delete('/matches/competition/{competitionId}/clear', [MatchController::class, 'clearCompetitionMatches'])->name('matches.clear');
    Route::delete('/matches/{id}', [MatchController::class, 'destroy'])->name('matches.destroy');

    // Live Control Panel
    Route::get('/live', [LiveControlController::class, 'index'])->name('live.index');
    Route::post('/live/{id}/status', [LiveControlController::class, 'updateStatus'])->name('live.status');
    Route::post('/live/{id}/event', [LiveControlController::class, 'addEvent'])->name('live.event');
    Route::delete('/live/event/{id}', [LiveControlController::class, 'deleteEvent'])->name('live.event.delete');
    Route::post('/live/{id}/motm', [LiveControlController::class, 'setMotm'])->name('live.motm');

    // Events Management
    Route::get('/events', [AdminEventController::class, 'index'])->name('events.index');
    Route::post('/events', [AdminEventController::class, 'store'])->name('events.store');
    Route::put('/events/{id}', [AdminEventController::class, 'update'])->name('events.update');
    Route::delete('/events/{id}', [AdminEventController::class, 'destroy'])->name('events.destroy');

    // Sponsors & About
    Route::get('/sponsors', [SponsorController::class, 'index'])->name('sponsors.index');
    Route::post('/sponsors', [SponsorController::class, 'store'])->name('sponsors.store');
    Route::post('/sponsors/about', [SponsorController::class, 'updateAbout'])->name('sponsors.about');
    Route::post('/sponsors/{id}', [SponsorController::class, 'update'])->name('sponsors.update.post');
    Route::put('/sponsors/{id}', [SponsorController::class, 'update'])->name('sponsors.update');
    Route::delete('/sponsors/{id}', [SponsorController::class, 'destroy'])->name('sponsors.destroy');

    // Registrants & Live Draft Roulette
    Route::get('/registrants', [AdminRegistrationController::class, 'index'])->name('registrants.index');
    Route::post('/registrants', [AdminRegistrationController::class, 'store'])->name('registrants.store');
    Route::post('/registrants/randomize', [AdminRegistrationController::class, 'randomize'])->name('registrants.randomize');
    Route::put('/registrants/{id}/status', [AdminRegistrationController::class, 'updateStatus'])->name('registrants.status');
    Route::post('/registrants/{id}/assign', [AdminRegistrationController::class, 'assignToTeam'])->name('registrants.assign');
    Route::delete('/registrants/{id}', [AdminRegistrationController::class, 'destroy'])->name('registrants.destroy');
    Route::post('/live-draft/sync', [TeamDraftController::class, 'syncLiveDraft'])->name('live-draft.sync');
    Route::post('/live-draft/clear', [TeamDraftController::class, 'clearLiveDraft'])->name('live-draft.clear');
});
