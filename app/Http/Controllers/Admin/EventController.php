<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function index(): Response
    {
        $events = Event::latest()->get();

        return Inertia::render('Admin/Events/Index', [
            'events' => $events,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'content' => 'required|string',
            'image_url' => 'nullable|url|max:1000',
            'author_name' => 'nullable|string|max:255',
            'is_published' => 'boolean',
        ]);

        if (empty($validated['author_name'])) {
            $validated['author_name'] = 'Panitia Turnamen Livasya';
        }

        Event::create($validated);

        return redirect()->back()->with('success', 'Posting Event berhasil dibuat!');
    }

    public function update(Request $request, int $id)
    {
        $event = Event::findOrFail($id);

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'content' => 'required|string',
            'image_url' => 'nullable|url|max:1000',
            'author_name' => 'nullable|string|max:255',
            'is_published' => 'boolean',
        ]);

        $event->update($validated);

        return redirect()->back()->with('success', 'Posting Event berhasil diperbarui!');
    }

    public function destroy(int $id)
    {
        $event = Event::findOrFail($id);
        $event->delete();

        return redirect()->back()->with('success', 'Posting Event berhasil dihapus!');
    }
}
