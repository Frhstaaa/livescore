<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

use App\Repositories\Contracts\MatchRepositoryInterface;
use App\Repositories\Eloquent\MatchRepository;
use App\Repositories\Contracts\TeamRepositoryInterface;
use App\Repositories\Eloquent\TeamRepository;
use App\Repositories\Contracts\PlayerRepositoryInterface;
use App\Repositories\Eloquent\PlayerRepository;
use App\Repositories\Contracts\StandingRepositoryInterface;
use App\Repositories\Eloquent\StandingRepository;
use App\Repositories\Contracts\LeaderboardRepositoryInterface;
use App\Repositories\Eloquent\LeaderboardRepository;
use App\Repositories\Contracts\SponsorRepositoryInterface;
use App\Repositories\Eloquent\SponsorRepository;

class RepositoryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(MatchRepositoryInterface::class, MatchRepository::class);
        $this->app->bind(TeamRepositoryInterface::class, TeamRepository::class);
        $this->app->bind(PlayerRepositoryInterface::class, PlayerRepository::class);
        $this->app->bind(StandingRepositoryInterface::class, StandingRepository::class);
        $this->app->bind(LeaderboardRepositoryInterface::class, LeaderboardRepository::class);
        $this->app->bind(SponsorRepositoryInterface::class, SponsorRepository::class);
    }

    public function boot(): void
    {
    }
}
