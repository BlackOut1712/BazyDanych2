<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\LotniskoController;
use App\Http\Controllers\TrasaController;
use App\Http\Controllers\LotController;
use App\Http\Controllers\SamolotController;
use App\Http\Controllers\MiejsceController;
use App\Http\Controllers\RezerwacjaController;
use App\Http\Controllers\KlientController;
use App\Http\Controllers\BiletController;
use App\Http\Controllers\PlatnoscController;
use App\Http\Controllers\PracownikController;

Route::get('/pracownik/bilety-oplacone', [BiletController::class, 'pracownikBiletyOplacone']);
Route::get('/pracownik/rezerwacje', [RezerwacjaController::class, 'pracownikRezerwacje']);
Route::get('/moje-bilety/{klient_id}', [BiletController::class, 'mojeBilety']);
Route::get('/pracownicy', [PracownikController::class, 'index']);
Route::post('/pracownicy', [PracownikController::class, 'store']);
Route::post('/bilety/zwrot', [PlatnoscController::class, 'zwrot']);
Route::get('/loty/{lot}/miejsca', [MiejsceController::class, 'miejscaDlaLotu']);

Route::post('/platnosci', [PlatnoscController::class, 'store']);
Route::put('/pracownicy/{id}', [PracownikController::class, 'update']);

Route::post('/bilety', [BiletController::class, 'store']);
Route::get('/bilety', [BiletController::class, 'index']);
Route::get('/klienci', [KlientController::class, 'index']);
Route::post('/klienci', [KlientController::class, 'store']);
Route::get('/klienci/{id}', [KlientController::class, 'show']);

Route::get('/rezerwacje', [RezerwacjaController::class, 'index']);
Route::post('/rezerwacje', [RezerwacjaController::class, 'store']);
Route::get('/rezerwacje/{id}', [RezerwacjaController::class, 'show']);
Route::delete('/rezerwacje/{id}', [RezerwacjaController::class, 'destroy']);

Route::post('/samoloty', [SamolotController::class, 'store']);
Route::get('/samoloty', [SamolotController::class, 'index']);

Route::post('/miejsca', [MiejsceController::class, 'store']);

Route::get('/loty', [LotController::class, 'index']);
Route::post('/loty', [LotController::class, 'store']);
Route::get('/loty/{id}', [LotController::class, 'show']);
Route::put('/loty/{id}', [LotController::class, 'update']);
Route::delete('/loty/{id}', [LotController::class, 'destroy']);
Route::get('/trasy', [TrasaController::class, 'index']);
Route::post('/trasy', [TrasaController::class, 'store']);
Route::get('/trasy/{id}', [TrasaController::class, 'show']);
Route::delete('/trasy/{id}', [TrasaController::class, 'destroy']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/login/pracownik', [AuthController::class, 'loginPracownik']);
Route::get('/lotniska', [LotniskoController::class, 'index']);
Route::post('/lotniska', [LotniskoController::class, 'store']);
Route::get('/lotniska/{id}', [LotniskoController::class, 'show']);
Route::put('/lotniska/{id}', [LotniskoController::class, 'update']);
Route::delete('/lotniska/{id}', [LotniskoController::class, 'destroy']);

Route::get('/pracownicy', [PracownikController::class, 'index']);
Route::post('/pracownicy', [PracownikController::class, 'store']);
Route::put('/pracownicy/{id}', [PracownikController::class, 'update']);
Route::put('/pracownicy/{id}/status', [PracownikController::class, 'toggleStatus']);

Route::get('/samoloty', [SamolotController::class, 'index']);
Route::post('/samoloty', [SamolotController::class, 'store']);
Route::put('/samoloty/{id}', [SamolotController::class, 'update']);
Route::get('/samoloty', [SamolotController::class, 'index']);
Route::post('/samoloty', [SamolotController::class, 'store']);
Route::put('/samoloty/{id}', [SamolotController::class, 'update']);
