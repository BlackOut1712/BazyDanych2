<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BiletController;
use Illuminate\Http\Request;

/* =========================
   API – BILETY (WEB → API)
========================= */
Route::get('/api/bilety/moje', function (Request $request) {

    $user = session('user');

    if (!$user || !isset($user['id'])) {
        return response()->json([], 200);
    }

    // 🔥 WSTRZYKUJEMY NAGŁÓWKI JAK API
    $request->headers->set('X-User-Role', 'CLIENT');
    $request->headers->set('X-Client-Id', $user['id']);

    // ⏩ DELEGACJA DO KONTROLERA
    return app(BiletController::class)->moje($request);
});

/* =========================
   TEST / BLIK (GLOBAL)
========================= */
Route::get('/blik', function () {
    return view('blik');
})->name('blik');

/* =========================
   STRONA GŁÓWNA
========================= */
Route::view('/', 'index');
Route::redirect('/index', '/');

/* =========================
   AUTH
========================= */
Route::view('/login', 'login');
Route::view('/register', 'register');

/* =========================
   CASHIER
========================= */
Route::prefix('cashier')->group(function () {

    Route::view('/dashboard', 'Cashier.dashboard')->name('kasjer.dashboard');
    Route::view('/sell', 'Cashier.sell');
    Route::view('/refund', 'Cashier.refund');
    Route::view('/menagment', 'Cashier.menagment');
    Route::view('/change-seat', 'Cashier.change-seat');

    // 🔍 WYSZUKIWARKA LOTÓW – KASJER
    Route::view('/search', 'Cashier.search')->name('cashier.search');

    /* =========================
       🧾 FAKTURA (PDF – WEB)
       → proxy do API (rozwiązuje 401)
    ========================= */
    Route::get('/faktura/{id}', [BiletController::class, 'fakturaWeb']);
});

/* =========================
   ADMIN
========================= */
Route::prefix('admin')->group(function () {
    Route::view('/dashboard', 'Admin.dashboard');
    Route::view('/flights', 'Admin.flights');
    Route::view('/planes', 'Admin.planes');
    Route::view('/routes', 'Admin.routes');
    Route::view('/workers', 'Admin.workers');
    Route::view('/stats', 'Admin.stats');
});

   /* =========================
      CLIENT
   ========================= */
   Route::prefix('client')->group(function () {

      Route::view('/dashboard', 'client.dashboard');
      Route::view('/tickets', 'client.tickets');
      Route::view('/history', 'client.history');
      Route::view('/payment', 'client.payment');
      Route::view('/seats', 'client.seats');
      Route::view('/search', 'client.search')->name('client.search');

      // ✅ ZMIANA MIEJSCA (KLIENT)
      Route::get('/client-change-seat', function () {
         return view('client.client-change-seat');
      })->name('client.change-seat');

      // ✅ ZWROT (KLIENT)
      Route::view('/refund', 'client.refund')->name('client.refund');

   
    /* =========================
       ✅ BLIK – CLIENT
    ========================= */
    Route::get('/blik-client', function () {
        return view('Client.blik-client'); // 🔥 POPRAWIONE
    })->name('client.blik');

    /* =================================================
       ✅ PROXY WEB → API (HISTORIA ZAKUPÓW)
       → rozwiązuje 403 + brak nagłówków
    ================================================= */
    Route::get('/api/bilety/moje', function (Request $request) {

        $user = session('user');

        if (!$user || !isset($user['id'])) {
            return response()->json([], 200);
        }

        // 🔥 WSTRZYKUJEMY NAGŁÓWKI JAK API
        $request->headers->set('X-User-Role', 'CLIENT');
        $request->headers->set('X-Client-Id', $user['id']);

        // ⏩ DELEGACJA DO KONTROLERA
        return app(BiletController::class)->moje($request);
    });
});
