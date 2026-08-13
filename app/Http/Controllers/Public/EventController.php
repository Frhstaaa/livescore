<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function index(): Response
    {
        $events = Event::where('is_published', true)
            ->latest()
            ->get();

        return Inertia::render('Event/Index', [
            'events' => $events,
        ]);
    }

    public function like(int $id)
    {
        $event = Event::findOrFail($id);
        $event->increment('likes_count');
        return back();
    }
}
