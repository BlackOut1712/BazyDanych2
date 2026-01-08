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
| KLIENT
|--------------------------------------------------------------------------
*/
Route::get('/moje-bilety/{klient_id}', [BiletController::class, 'mojeBilety']);
Route::get('/klienci', [KlientController::class, 'index']);
Route::post('/klienci', [KlientController::class, 'store']);
Route::get('/klienci/{id}', [KlientController::class, 'show']);

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
| BILETY / PŁATNOŚCI
|--------------------------------------------------------------------------
*/
Route::post('/bilety', [BiletController::class, 'store']);
Route::get('/bilety', [BiletController::class, 'index']);
Route::post('/bilety/zwrot', [PlatnoscController::class, 'zwrot']);

Route::post('/platnosci', [PlatnoscController::class, 'store']);

/*
|--------------------------------------------------------------------------
| REZERWACJE
|--------------------------------------------------------------------------
*/
Route::get('/rezerwacje', [RezerwacjaController::class, 'index']);
Route::post('/rezerwacje', [RezerwacjaController::class, 'store']);
Route::get('/rezerwacje/{id}', [RezerwacjaController::class, 'show']);
Route::delete('/rezerwacje/{id}', [RezerwacjaController::class, 'destroy']);
Route::get('/pracownik/rezerwacje', [RezerwacjaController::class, 'pracownikRezerwacje']);

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

Route::get('/loty/{lot}/miejsca', [MiejsceController::class, 'miejscaDlaLotu']);

Route::get('/trasy', [TrasaController::class, 'index']);
Route::post('/trasy', [TrasaController::class, 'store']);
Route::get('/trasy/{id}', [TrasaController::class, 'show']);
Route::delete('/trasy/{id}', [TrasaController::class, 'destroy']);

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

Route::get('/loty/{id}/miejsca', [LotController::class, 'dostepneMiejsca']);
