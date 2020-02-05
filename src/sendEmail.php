<?php

switch ($_SERVER['REQUEST_METHOD']) {
    case("OPTIONS"): //Allow preflighting to take place.
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: POST");
        header("Access-Control-Allow-Headers: content-type");
        exit;
    case("POST"): //Send the email;
        header("Access-Control-Allow-Origin: *");

        $json = file_get_contents('php://input');

        $params = json_decode($json);

        $name = $params->name;
        $email = $params->email;
        // $company = $params->company;
        // $phone = $params->phone;
        $message = $params->message;

        $recipient = 'smandable@gmail.com';
        $subject = 'New sean@seanmandable.me contact form submission';

        $headers[] = 'MIME-Version: 1.0';
        $headers[] = 'Content-type: text/html; charset=iso-8859-1';
        $headers[] = 'To: Sean Mandable <smandable@gmail.com>';
        $headers[] = 'From: ' . $name . '<dh_nb6jhz@rhyme.dreamhost.com>';
        $headers[] = 'Sender: <dh_nb6jhz@rhyme.dreamhost.com>';
        $headers[] = 'Reply-To: ' . $name . '<' . $email . '>';


        if (mail($recipient, $subject, $message, implode("\r\n", $headers))) {
            $response = "Success";
        } else {
            $response = "Fail";
        }
        echo json_encode($response);
        break;
    default: //Reject any non POST or OPTIONS requests.
        header("Allow: POST", true, 405);
        exit;
}
