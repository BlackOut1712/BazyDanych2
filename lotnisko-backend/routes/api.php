<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{
    AuthController,
    LotniskoController,
    TrasaController,
    LotController,
    SamolotController,
    MiejsceController,
    RezerwacjaController,
    KlientController,
    BiletController,
    PlatnoscController,
    PracownikController
};

/*
|--------------------------------------------------------------------------
| AUTH
|--------------------------------------------------------------------------
*/
Route::post('/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| KLIENCI
|--------------------------------------------------------------------------
*/
Route::get('/klienci', [KlientController::class, 'index']);
Route::post('/klienci', [KlientController::class, 'store']);
Route::get('/klienci/{id}', [KlientController::class, 'show']);

/*
|--------------------------------------------------------------------------
| 🔥 BILETY KLIENTA (NOWA LOGIKA – NAGŁÓWKI)
|--------------------------------------------------------------------------
| UŻYWANE PRZEZ:
| - frontend (history.js)
| - Postman
*/
Route::get('/moje-bilety', [BiletController::class, 'moje']);

/*
|--------------------------------------------------------------------------
| ⚠️ STARA LOGIKA (ZOSTAJE – ale NA KOŃCU)
|--------------------------------------------------------------------------
| Jeśli kiedyś frontend jej użyje ręcznie
*/
Route::get('/moje-bilety/{klient_id}', function ($klient_id, Illuminate\Http\Request $request) {

    // nagłówki jak API
    $request->headers->set('X-User-Role', 'CLIENT');
    $request->headers->set('X-Client-Id', $klient_id);

    return app(\App\Http\Controllers\BiletController::class)->moje($request);
});


/*
|--------------------------------------------------------------------------
| PRACOWNIK
|--------------------------------------------------------------------------
*/
Route::get('/pracownik/rezerwacje', [RezerwacjaController::class, 'pracownikRezerwacje']);
Route::get('/pracownik/bilety-oplacone', [BiletController::class, 'pracownikBiletyOplacone']);

/*
|--------------------------------------------------------------------------
| PRACOWNICY (MENADŻER)
|--------------------------------------------------------------------------
*/
Route::get('/pracownicy', [PracownikController::class, 'index']);
Route::post('/pracownicy', [PracownikController::class, 'store']);
Route::put('/pracownicy/{id}', [PracownikController::class, 'update']);
Route::put('/pracownicy/{id}/status', [PracownikController::class, 'toggleStatus']);

/*
|--------------------------------------------------------------------------
| REZERWACJE
|--------------------------------------------------------------------------
*/
Route::get('/rezerwacje', [RezerwacjaController::class, 'index']);
Route::post('/rezerwacje', [RezerwacjaController::class, 'store']);
Route::get('/rezerwacje/{id}', [RezerwacjaController::class, 'show']);
Route::delete('/rezerwacje/{id}', [RezerwacjaController::class, 'destroy']);
Route::post('/rezerwacje/zmien-miejsce', [RezerwacjaController::class, 'zmienMiejsce']);

/*
|--------------------------------------------------------------------------
| BILETY / PŁATNOŚCI
|--------------------------------------------------------------------------
*/

Route::get('/bilety', [BiletController::class, 'index']);
Route::post('/bilety', [BiletController::class, 'store']);
Route::get('/pracownik/bilety', [BiletController::class, 'index']);
Route::get('/bilety/{id}', [BiletController::class, 'show']);

Route::post('/bilety/zwrot/{id}', [PlatnoscController::class, 'zwrotKasjerski']);
Route::post('/platnosci', [PlatnoscController::class, 'store']);

Route::get('/bilety/{id}/faktura', function ($id) {
    return redirect("/cashier/faktura/{$id}");
});

Route::get('/client/bilety/{id}', [BiletController::class, 'biletKlienta']);
Route::post('/client/bilety/zwrot', [BiletController::class, 'refundClient']);

/* ✅ OPŁACENIE ISTNIEJĄCEGO BILETU */
Route::post('/bilety/{id}/pay', [BiletController::class, 'payExisting']);


/*
|--------------------------------------------------------------------------
| 🔥 KLIENT – ZAKUP
|--------------------------------------------------------------------------
*/
Route::post('/bilety/client', [BiletController::class, 'storeClient']);
Route::post('/bilety/po-platnosci', [BiletController::class, 'createAfterPayment']);
Route::post('/bilety/kup', [BiletController::class, 'kupBilet']);
Route::get('/client/bilety/{id}', [BiletController::class, 'showForClient']);
Route::get('/client/bilet/{id}', [BiletController::class, 'biletKlienta']);
/*
|--------------------------------------------------------------------------
| LOTY / TRASY / LOTNISKA
|--------------------------------------------------------------------------
*/
Route::get('/loty', [LotController::class, 'index']);
Route::post('/loty', [LotController::class, 'store']);
Route::get('/loty/{id}', [LotController::class, 'show']);
Route::put('/loty/{id}', [LotController::class, 'update']);
Route::delete('/loty/{id}', [LotController::class, 'destroy']);

Route::get('/loty/{id}/ceny', function ($id) {
    return \App\Models\Lot::with('ceny')->findOrFail($id)->ceny;
});

Route::get('/loty/{lot}/miejsca', [MiejsceController::class, 'miejscaDlaLotu']);

/*
|--------------------------------------------------------------------------
| TRASY
|--------------------------------------------------------------------------
*/
Route::get('/trasy', [TrasaController::class, 'index']);
Route::post('/trasy', [TrasaController::class, 'store']);
Route::get('/trasy/{id}', [TrasaController::class, 'show']);
Route::delete('/trasy/{id}', [TrasaController::class, 'destroy']);

/*
|--------------------------------------------------------------------------
| LOTNISKA
|--------------------------------------------------------------------------
*/
Route::get('/lotniska', [LotniskoController::class, 'index']);
Route::post('/lotniska', [LotniskoController::class, 'store']);
Route::get('/lotniska/{id}', [LotniskoController::class, 'show']);
Route::put('/lotniska/{id}', [LotniskoController::class, 'update']);
Route::delete('/lotniska/{id}', [LotniskoController::class, 'destroy']);

/*
|--------------------------------------------------------------------------
| SAMOLOTY / MIEJSCA
|--------------------------------------------------------------------------
*/
Route::get('/samoloty', [SamolotController::class, 'index']);
Route::post('/samoloty', [SamolotController::class, 'store']);
Route::put('/samoloty/{id}', [SamolotController::class, 'update']);

Route::post('/miejsca', [MiejsceController::class, 'store']);
