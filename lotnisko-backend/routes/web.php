<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BiletController;
use Illuminate\Http\Request;


Route::get('/api/bilety/moje', function (Request $request) {

    $user = session('user');

    if (!$user || !isset($user['id'])) {
        return response()->json([], 200);
    }

    
    $request->headers->set('X-User-Role', 'CLIENT');
    $request->headers->set('X-Client-Id', $user['id']);

    
    return app(BiletController::class)->moje($request);
});


Route::get('/blik', function () {
    return view('blik');
})->name('blik');


Route::view('/', 'index');
Route::redirect('/index', '/');


Route::view('/login', 'login');
Route::view('/register', 'register');


Route::prefix('cashier')->group(function () {

    Route::view('/dashboard', 'Cashier.dashboard')->name('kasjer.dashboard');
    Route::view('/sell', 'Cashier.sell');
    Route::view('/refund', 'Cashier.refund');
    Route::view('/menagment', 'Cashier.menagment');
    Route::view('/change-seat', 'Cashier.change-seat');

   
    Route::view('/search', 'Cashier.search')->name('cashier.search');


    Route::get('/faktura/{id}', [BiletController::class, 'fakturaWeb']);
});


Route::prefix('admin')->group(function () {
    Route::view('/dashboard', 'Admin.dashboard');
    Route::view('/flights', 'Admin.flights');
    Route::view('/planes', 'Admin.planes');
    Route::view('/routes', 'Admin.routes');
    Route::view('/workers', 'Admin.workers');
    Route::view('/stats', 'Admin.stats');
});


   Route::prefix('client')->group(function () {

      Route::view('/dashboard', 'client.dashboard');
      Route::view('/tickets', 'client.tickets');
      Route::view('/history', 'client.history');
      Route::view('/payment', 'client.payment');
      Route::view('/seats', 'client.seats');
      Route::view('/search', 'client.search')->name('client.search');

      
      Route::get('/client-change-seat', function () {
         return view('client.client-change-seat');
      })->name('client.change-seat');

     
      Route::view('/refund', 'client.refund')->name('client.refund');
      Route::get('/profile', function () {
         return view('client.profile');
      });

   
   
    Route::get('/blik-client', function () {
        return view('Client.blik-client'); 
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
