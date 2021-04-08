<?php

switch ($_SERVER['REQUEST_METHOD']) {
    case ("OPTIONS"): //Allow preflighting to take place.
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: POST");
        header("Access-Control-Allow-Headers: content-type");
        exit;
    case ("POST"): //Send the email;
        header("Access-Control-Allow-Origin: *");

        // $json = file_get_contents('php://input');
        // $params = json_decode($json);

        $params = json_decode(file_get_contents('php://input'), true);

        // echo "params:\n";
        // print_r($params);
        // $name = $params->name;
        // $email = $params->email;
        // $message = $params->message;

        $name = "Sean";
        $email = "smandable@gmail.com";
        $message = "test";

        $recipient = 'smandable@gmail.com';
        $subject = 'new message';
        $headers = "From: $name <$email>";

        mail($recipient, $subject, $message, $headers);
        return 'success';
        break;
    default: //Reject any non POST or OPTIONS requests.
        header("Allow: POST", true, 405);
        exit;
}
