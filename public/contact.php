<?php
declare(strict_types=1);

// ---- Config ---------------------------------------------------------------

// Send to sean@seanmandable.me (forward-only alias → smandable@gmail.com).
// Using an on-domain From address keeps SPF/DKIM aligned on Dreamhost's mail servers.
const RECIPIENT   = 'sean@seanmandable.me';
const SENDER_FROM = 'sean@seanmandable.me';
const SENDER_NAME = 'seanmandable.me';

const MAX_NAME_LEN    = 100;
const MAX_EMAIL_LEN   = 200;
const MAX_MESSAGE_LEN = 5000;

// ---- Helpers --------------------------------------------------------------

function respond(int $status, array $body): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($body, JSON_UNESCAPED_SLASHES);
    exit;
}

function stripCrlf(string $value): string
{
    return preg_replace('/[\r\n]+/', ' ', $value) ?? '';
}

// ---- Entrypoint -----------------------------------------------------------

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(405, ['error' => 'Method not allowed']);
}

$input = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($input)) {
    respond(400, ['error' => 'Invalid JSON']);
}

// Honeypot — silently succeed so bots don't retry.
if (!empty($input['website'] ?? '')) {
    respond(200, ['ok' => true]);
}

$name    = trim((string) ($input['name']    ?? ''));
$email   = trim((string) ($input['email']   ?? ''));
$message = trim((string) ($input['message'] ?? ''));

$errors = match (true) {
    $name === ''                                        => 'Name is required.',
    !filter_var($email, FILTER_VALIDATE_EMAIL)          => 'A valid email is required.',
    $message === ''                                     => 'Message is required.',
    strlen($name)    > MAX_NAME_LEN                     => 'Name is too long.',
    strlen($email)   > MAX_EMAIL_LEN                    => 'Email is too long.',
    strlen($message) > MAX_MESSAGE_LEN                  => 'Message is too long.',
    default                                             => null,
};

if ($errors !== null) {
    respond(422, ['error' => $errors]);
}

$safeName  = stripCrlf($name);
$safeEmail = stripCrlf($email);

$subject = "Contact form: {$safeName}";
$headers = implode("\r\n", [
    'From: ' . SENDER_NAME . ' <' . SENDER_FROM . '>',
    "Reply-To: {$safeName} <{$safeEmail}>",
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . PHP_VERSION,
]);

$body = "Name: {$name}\nEmail: {$email}\n\n{$message}\n";

if (!mail(RECIPIENT, $subject, $body, $headers)) {
    respond(500, ['error' => 'Mail send failed.']);
}

respond(200, ['ok' => true]);
