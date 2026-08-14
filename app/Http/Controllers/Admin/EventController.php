<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Helpers\ImageHelper;
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
            'image_url' => 'nullable|string|max:1000',
            'image_file' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
            'author_name' => 'nullable|string|max:255',
            'is_published' => 'boolean',
        ]);

        if ($request->hasFile('image_file')) {
            $validated['image_url'] = ImageHelper::convertToWebp($request->file('image_file'), 'uploads/events');
        }

        unset($validated['image_file']);

        if (empty($validated['author_name'])) {
            $validated['author_name'] = 'Panitia Turnamen Livasya';
        }

        Event::create($validated);

        return redirect()->back()->with('success', 'Posting Event & Foto berhasil diterbitkan!');
    }

    public function update(Request $request, int $id)
    {
        $event = Event::findOrFail($id);

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'content' => 'required|string',
            'image_url' => 'nullable|string|max:1000',
            'image_file' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
            'author_name' => 'nullable|string|max:255',
            'is_published' => 'boolean',
        ]);

        if ($request->hasFile('image_file')) {
            $validated['image_url'] = ImageHelper::convertToWebp($request->file('image_file'), 'uploads/events');
        }

        unset($validated['image_file']);

        $event->update($validated);

        return redirect()->back()->with('success', 'Posting Event & Foto berhasil diperbarui!');
    }

    public function destroy(int $id)
    {
        $event = Event::findOrFail($id);
        $event->delete();

        return redirect()->back()->with('success', 'Posting Event berhasil dihapus!');
    }
}
