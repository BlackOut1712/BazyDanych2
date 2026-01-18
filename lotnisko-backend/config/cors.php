<?php

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    // pozwalamy na wszystko (DEV)
    'allowed_methods' => ['*'],

    // NA DEV MUSI BYĆ *
    // inaczej Origin: null ZAWSZE polegnie
    'allowed_origins' => ['*'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // MUSI być false przy allowed_origins = ['*']
    'supports_credentials' => false,
];
