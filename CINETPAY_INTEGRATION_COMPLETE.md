<?php 
class Fapshi {

    const BASEURL = 'https://live.fapshi.com';
    const HEADERS = array(
        'apiuser: replace_me_with_apiuser',
        'apikey: replace_me_with_apikey',
        'Content-Type: application/json'
    );
    const ERRORS = array(
        'invalid type, string expected',
        'invalid type, array expected',
        'amount required',
        'amount must be of type integer',
        'amount cannot be less than 100 XAF',
    );


    public function initiate_pay(array $data) : array {
        if(!is_array($data)){
            $error = array('message'=>Fapshi::ERRORS[1],'statusCode'=>400);
        }
        else if(!array_key_exists('amount', $data)){
            $error = array('message'=>Fapshi::ERRORS[2],'statusCode'=>400);
        }
        else if(!is_int($data['amount'])){
            $error = array('message'=>Fapshi::ERRORS[3],'statusCode'=>400);
        }
        else if($data['amount']<100){
            $error = array('message'=>Fapshi::ERRORS[4],'statusCode'=>400);
        }
        if(isset($error)){
            return $error;
        }

        $url = Fapshi::BASEURL.'/initiate-pay';
        $curl = curl_init();

        curl_setopt_array($curl, array(
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_POSTFIELDS => json_encode($data),
            CURLOPT_HTTPHEADER => Fapshi::HEADERS,
        ));

        $response = curl_exec($curl);
        $response = json_decode($response, true);
        $response['statusCode'] = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);
        return $response;
    }
    

    public function direct_pay(array $data) : array {
        if(!is_array($data)){
            $error = array('message'=>Fapshi::ERRORS[0],'statusCode'=>400);
        }
        else if(!array_key_exists('amount', $data)){
            $error = array('message'=>Fapshi::ERRORS[2],'statusCode'=>400);
        }
        else if(!is_int($data['amount'])){
            $error = array('message'=>Fapshi::ERRORS[3],'statusCode'=>400);
        }
        else if($data['amount']<100){
            $error = array('message'=>Fapshi::ERRORS[4],'statusCode'=>400);
        }
        else if(!array_key_exists('phone', $data)){
            $error = array('message'=>'phone number required','statusCode'=>400);
        }
        else if(!is_string($data['phone'])){
            $error = array('message'=>'phone must be of type string','statusCode'=>400);
        }
        else if(!preg_match('/^6[0-9]{8}$/', $data['phone'])){
            $error = array('message'=>'invalid phone number','statusCode'=>400);
        }
        if(isset($error)){
            return $error;
        }

        $url = Fapshi::BASEURL.'/direct-pay';
        $curl = curl_init();

        curl_setopt_array($curl, array(
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_POSTFIELDS => json_encode($data),
            CURLOPT_HTTPHEADER => Fapshi::HEADERS,
        ));

        $response = curl_exec($curl);
        $response = json_decode($response, true);
        $response['statusCode'] = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);
        return $response;
    }


    public function payment_status(string $transId) : array {
        if(!is_string($transId) || empty($transId)){
            return array('message'=>Fapshi::ERRORS[0],'statusCode'=>400);
        }
        if(!preg_match('/^[a-zA-Z0-9]{8,10}$/', $transId)){
            return array('message'=>'invalid transaction id','statusCode'=>400);
        }

        $url = Fapshi::BASEURL.'/payment-status/'.$transId;
        $curl = curl_init();

        curl_setopt_array($curl, array(
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST => 'GET',
            CURLOPT_HTTPHEADER => Fapshi::HEADERS,
        ));

        $response = curl_exec($curl);
        $response = json_decode($response, true);
        $response['statusCode'] = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);
        return $response;
    }


    public function expire_pay(string $transId) : array {
        if(!is_string($transId) || empty($transId)){
            return array('message'=>Fapshi::ERRORS[0],'statusCode'=>400);
        }
        if(!preg_match('/^[a-zA-Z0-9]{8,10}$/', $transId)){
            return array('message'=>'invalid transaction id','statusCode'=>400);
        }

        $data = array('transId'=> $transId);
        $url = Fapshi::BASEURL.'/expire-pay';
        $curl = curl_init();

        curl_setopt_array($curl, array(
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_POSTFIELDS => json_encode($data),
            CURLOPT_HTTPHEADER => Fapshi::HEADERS,
        ));

        $response = curl_exec($curl);
        $response = json_decode($response, true);
        $response['statusCode'] = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);
        return $response;
    }


    public function get_user_trans(string $userId) : array {
        if(!is_string($userId) || empty($userId)){
            return array('message'=>Fapshi::ERRORS[0],'statusCode'=>400);
        }
        if(!preg_match('/^[a-zA-Z0-9-_]{1,100}$/', $userId)){
            return array('message'=>'invalid user id','statusCode'=>400);
        }

        $url = Fapshi::BASEURL.'/transaction/'.$userId;
        $curl = curl_init();

        curl_setopt_array($curl, array(
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST => 'GET',
            CURLOPT_HTTPHEADER => Fapshi::HEADERS,
        ));

        $response = curl_exec($curl);
        $response = json_decode($response, true);
        curl_close($curl);
        return $response;
    }

    
    public function balance() : array {
        $url = Fapshi::BASEURL.'/balance';
        $curl = curl_init();

        curl_setopt_array($curl, array(
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST => 'GET',
            CURLOPT_HTTPHEADER => Fapshi::HEADERS,
        ));

        $response = curl_exec($curl);
        $response = json_decode($response, true);
        $response['statusCode'] = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);
        return $response;
    }


    public function payout(array $data) : array {
        if(!is_array($data)){
            $error = array('message'=>Fapshi::ERRORS[0],'statusCode'=>400);
        }
        else if(!array_key_exists('amount', $data)){
            $error = array('message'=>Fapshi::ERRORS[2],'statusCode'=>400);
        }
        else if(!is_int($data['amount'])){
            $error = array('message'=>Fapshi::ERRORS[3],'statusCode'=>400);
        }
        else if($data['amount']<100){
            $error = array('message'=>Fapshi::ERRORS[4],'statusCode'=>400);
        }
        else if(!array_key_exists('phone', $data)){
            $error = array('message'=>'phone number required','statusCode'=>400);
        }
        else if(!is_string($data['phone'])){
            $error = array('message'=>'phone must be of type string','statusCode'=>400);
        }
        else if(!preg_match('/^6[0-9]{8}$/', $data['phone'])){
            $error = array('message'=>'invalid phone number','statusCode'=>400);
        }
        if(isset($error)){
            return $error;
        }

        $url = Fapshi::BASEURL.'/payout';
        $curl = curl_init();

        curl_setopt_array($curl, array(
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_POSTFIELDS => json_encode($data),
            CURLOPT_HTTPHEADER => Fapshi::HEADERS,
        ));

        $response = curl_exec($curl);
        $response = json_decode($response, true);
        $response['statusCode'] = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);
        return $response;
    }


    public function search(array $params) : array {

        $url = Fapshi::BASEURL.'/search?'.http_build_query($params);
        $curl = curl_init();

        curl_setopt_array($curl, array(
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST => 'GET',
            CURLOPT_HTTPHEADER => Fapshi::HEADERS,
        ));

        $response = curl_exec($curl);
        $response = json_decode($response, true);
        curl_close($curl);
        return $response;
    }

}

<!-- 
    Example of how to initiate a payment using the fapshi PHP SDK
    Before running this script, make sure to add your apiuser and apikey to your Fapshi.php file
-->
<?php
include 'Fapshi.php';

$fapshi = new Fapshi();
$payment= array(
    'amount'=> 500, //fapshi
    'email'=> 'myuser@email.com',
    'externalId'=> '12345',
    'userId'=> 'abcde',
    'redirectUrl'=> 'https://mywebsite.com',
    'message'=> 'testing php SDK',
); 
$resp = $fapshi->initiate_pay($payment);
echo json_encode($resp);


// Example of how to search/filter transctions using the fapshi PHP SDK
$query= array(
    // 'amt'=> '500',
    // 'status'=> 'SUCCESSFUL',
    // 'medium'=> 'orange money',
    'limit'=> 3,
    'sort'=> 'asc',
    'start'=> '2023-12-01',
    'end'=> '2024-12-01',
); 
$trans = $fapshi->search($query);
echo json_encode($trans);

<?php
// server.php
//
// Use this sample code to handle webhook events in your integration.
//
// 1) Paste this code into a new file (server.php)
//
// 2) Run the server on http://localhost:4242
//   php -S localhost:4242

require 'vendor/autoload.php';
include 'Fapshi.php';

$fapshi = new Fapshi();

$request_body = @file_get_contents('php://input');
$payload = json_decode($request_body);
// Get the transaction status from fapshi's API to be sure of its source
$event = $fapshi->payment_status($payload->{'transId'});
if($event['statusCode'] != 200){
    http_response_code(400);
    exit();
}

// Handle the event
switch ($event['status']) {
  case 'SUCCESSFUL':
    // Then define and call a function to handle a SUCCESSFUL payment
    echo 'successful - '+json_encode($event);
  case 'FAILED':
    // Then define and call a function to handle a FAILED payment
    echo 'failed - '+json_encode($event);
  case 'EXPIRED':
    // Then define and call a function to handle an expired transaction
    echo 'expired - '+json_encode($event);
  // ... handle other event types
  default:
    echo 'Unhandled event status:' . $event['status'];
}

http_response_code(200);