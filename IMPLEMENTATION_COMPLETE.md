


DOCUMENTATION D'INTEGRATION
Cross Payment Service API

Guide d'integration pour developpeurs Mobile (React Native) et Web (React/Next.js)

───────────────────────────────────────────────────────

Version : 1.0
Date : 08 April 2026
URL Base : http://localhost:3000
 
Sommaire
1.  Vue d'ensemble
2.  Configuration de base
3.  Authentification
4.  Endpoints — Paiements
     4.1  CashIn (depot Mobile Money)
     4.2  CashOut (retrait vers Mobile Money)
     4.3  TopUp (recharge telephone)
     4.4  Paiement de facture simple
     4.5  Recherche et paiement de facture (SEARCHABLE_BILL)
     4.6  Achat produit TV (Canal+, StarTimes, DSTV)
     4.7  Abonnement (ENEO Prepaid, CNPS)
     4.8  Verification d'une transaction
5.  Endpoints — Portefeuille (Wallet)
6.  Services disponibles (reference)
7.  Codes d'erreur
8.  Exemples complets — React Native
9.  Exemples complets — React / Next.js
10. Codes de statut HTTP
 
1. Vue d'ensemble
Le Cross Payment Service est une API REST centralisee qui gere tous les flux de paiement Mobile Money pour vos applications. Il s'integre avec SmobilPay S3P (Maviance) et expose des endpoints simples pour vos apps mobile et web.

Vos applications n'ont jamais acces direct a SmobilPay — elles parlent uniquement a cette API. Les cles et secrets Maviance restent cotes serveur.
1.1 Architecture generale
App Mobile (React Native)  ──┐
                             ├──► Cross Payment Service (port 3000)
App Web (React/Next.js)    ──┘          │
                                        ▼
                              SmobilPay S3P (Maviance)
                         [MTN MoMo | Orange Money | EU | Yoomee]

1.2 URL de base
Developpement	http://localhost:3000
Production	https://votre-domaine.com (a configurer)
Format des requetes	application/json
Format des reponses	application/json
Encodage	UTF-8
 
2. Configuration de base
2.1 React Native
Creez un fichier de configuration api.js dans votre projet :
// src/config/api.js
export const API_BASE_URL = 'http://localhost:3000'; // dev
// export const API_BASE_URL = 'https://votre-api.com'; // prod

export const apiClient = {
  post: async (endpoint, body) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur serveur');
    }
    return response.json();
  },
  get: async (endpoint) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) throw new Error('Erreur serveur');
    return response.json();
  },
};
2.2 React / Next.js (avec Axios)
// src/lib/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
});

// Intercepteur pour les erreurs
api.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error.response?.data || error.message)
);

export default api;
 
3. Authentification
L'API ne requiert pas d'authentification cliente pour le moment (JWT a integrer prochainement). Vos requetes n'ont pas besoin de header d'autorisation — l'authentification avec SmobilPay est geree entierement cote serveur.
Important : Chaque requete necessite un userId qui identifie l'utilisateur dans votre systeme. Ce userId est utilise pour gerer le portefeuille interne (solde, historique). Utilisez l'identifiant unique de votre utilisateur connecte (ex: UUID, ID de votre base).
 
4. Endpoints — Paiements
4.1 CashIn — Depot Mobile Money vers portefeuille
Permet a un utilisateur de deposer de l'argent depuis son telephone Mobile Money vers son portefeuille dans l'application. Il recoira une notification push sur son telephone pour confirmer le paiement.
Methode	POST
URL	/payments/cashin
Operateurs	MTN MoMo (20052), Orange Money (30052), Express Union (30001), Yoomee (100237)

Corps de la requete (JSON) :
Champ	Type	Obligatoire	Description
userId	string	Oui	Identifiant unique de l'utilisateur dans votre app
serviceId	string	Oui	ID du service (ex: "20052" pour MTN MoMo)
payItemId	string	Oui	ID de l'article a payer (obtenu via GET /payments/services/cashin/{serviceId})
amount	number	Oui	Montant en XAF (minimum 100)
phoneNumber	string	Oui	Numero de telephone Mobile Money du client (ex: "237677389120")
customerName	string	Oui	Nom complet du client
customerEmail	string	Non	Email du client
customerAddress	string	Non	Adresse du client

Exemple de requete :
POST /payments/cashin
Content-Type: application/json

{
  "userId": "user-uuid-123",
  "serviceId": "20052",
  "payItemId": "S-112-948-MTNMOMO-20052-200040001-1",
  "amount": 5000,
  "phoneNumber": "237677389120",
  "customerName": "Jean Dupont",
  "customerEmail": "jean@email.com",
  "customerAddress": "Douala, Cameroun"
}
Reponse en cas de succes (HTTP 201) :
{
  "id": "a6e1edcc-a244-418b-86e6-be4e55c0a9c3",
  "trid": "23fe94bc3b6f4893",
  "userId": "user-uuid-123",
  "type": "CASHIN",
  "status": "SUCCESS",
  "amount": 5000,
  "currency": "XAF",
  "serviceId": "20052",
  "ptn": "99999177561350000028046975935700",
  "phoneNumber": "237677389120",
  "createdAt": "2026-04-08T01:58:12.791Z"
}

Note : status="SUCCESS" signifie que la transaction a ete soumise et le PTN recu. Le statut final (confirmation du client) peut etre verifie via GET /payments/verify?trid=...
 
4.2 CashOut — Retrait portefeuille vers Mobile Money
Permet a un utilisateur de retirer de l'argent de son portefeuille interne vers son compte Mobile Money. Le solde est verifie avant tout traitement. En cas d'echec, le montant est automatiquement rembourse.
Methode	POST
URL	/payments/cashout
Operateurs	MTN MoMo (20053), Orange Money (30053), Express Union (90010), Yoomee (100239)
Prerequis	Solde suffisant dans le portefeuille

Corps de la requete (JSON) :
Champ	Type	Obligatoire	Description
userId	string	Oui	Identifiant de l'utilisateur
serviceId	string	Oui	"20053" MTN, "30053" Orange, "90010" EU
payItemId	string	Oui	Obtenu via GET /payments/services/cashout/{serviceId}
amount	number	Oui	Montant a retirer (doit etre <= solde du wallet)
destinationPhone	string	Oui	Numero Mobile Money de destination
customerName	string	Oui	Nom du client
customerEmail	string	Non	Email du client
customerAddress	string	Non	Adresse du client

Exemple de requete :
POST /payments/cashout
Content-Type: application/json

{
  "userId": "user-uuid-123",
  "serviceId": "20053",
  "payItemId": "S-112-949-MTNMOMO-20053-200050001-1",
  "amount": 2000,
  "destinationPhone": "237677389120",
  "customerName": "Jean Dupont",
  "customerEmail": "jean@email.com"
}
Erreur solde insuffisant (HTTP 400) :
{
  "statusCode": 400,
  "message": "Solde insuffisant. Disponible: 1000 XAF, Demande: 2000 XAF"
}
 
4.3 TopUp — Recharge telephonique
Permet de recharger un numero de telephone depuis le portefeuille interne.
Methode	POST
URL	/payments/topup
Operateurs	MTN (20051), Orange (20062), Camtel (20101), Nexttel (20002), Yoomee (20003), MTN Data (20041)

POST /payments/topup

{
  "userId": "user-uuid-123",
  "serviceId": "20051",
  "payItemId": "...",   // obtenu via GET /payments/services/cashin/20051
  "amount": 1000,
  "phoneNumber": "237677389120",
  "customerName": "Jean Dupont"
}

4.4 Paiement de facture simple
Methode	POST
URL	/payments/bill

POST /payments/bill

{
  "userId": "user-uuid-123",
  "serviceId": "202305",
  "payItemId": "...",
  "merchant": "CMKCT",
  "serviceNumber": "NB100001-231002086",
  "amount": 15000,
  "phoneNumber": "237677389120",
  "customerName": "Jean Dupont"
}

4.5 Facture avec recherche (Camwater, ENEO, CNPS, Douanes, DGI)
Ce flux est en 2 etapes : recherche de la facture, puis paiement.
Etape 1 — Rechercher la facture :
Methode	GET
URL	/payments/bill/lookup
Parametres	?serviceId=90007&merchant=CAMWATER&serviceNumber=010178181220101

GET /payments/bill/lookup?serviceId=90007&merchant=CAMWATER&serviceNumber=010178181220101

// Reponse :
{
  "payItemId": "S-112-950-CAMWATER-90007-...",
  "serviceNumber": "010178181220101",
  "amountLocalCur": "4174.00",
  "payItemDescr": "FACTURE DE CONSOMATION CAMWATER",
  "billMonth": "03",
  "billYear": "2024",
  "billType": "OVERDUE"
}
Etape 2 — Payer la facture :
Methode	POST
URL	/payments/bill/searchable

POST /payments/bill/searchable

{
  "userId": "user-uuid-123",
  "serviceId": "90007",
  "merchant": "CAMWATER",
  "serviceNumber": "010178181220101",
  "payItemId": "S-112-950-CAMWATER-90007-...", // recu a l'etape 1
  "amount": 4174,
  "phoneNumber": "237677389120",
  "customerName": "Jean Dupont"
}

Services disponibles pour SEARCHABLE_BILL :
Service	serviceId	merchant
Camwater	90007	CAMWATER
ENEO Postpaid	10039	ENEO
CNPS Obligatoire	1004	CMCNPS
Douanes	202303	CMDOUANES
DI Douanes	202306	CMDIDOUANES
DGI Impots	202302	CMDGI
 
4.6 Achat produit TV (Canal+, StarTimes, DSTV, EasyTV)
Methode	POST
URL	/payments/product

// Etape 1 : obtenir les formules disponibles
GET /payments/services/product/20021
// => liste des formules StarTimes avec payItemId et prix

// Etape 2 : payer
POST /payments/product

{
  "userId": "user-uuid-123",
  "serviceId": "20021",
  "payItemId": "S-112-952-CMStarTimes-20021-900210-1",
  "amount": 5000,
  "serviceNumber": "02167682266",  // numero abonne decoder
  "phoneNumber": "237677389120",
  "customerName": "Jean Dupont"
}

Service TV	serviceId	Formules
Canal+	14021	1 formule (montant libre)
StarTimes	20021	5 formules (Smart, Nova, Basic, Classic, Super)
DSTV	202301	12 formules (Family, Compact, Premium...)
Easy TV	91006	Formules disponibles via API

4.7 Abonnement (ENEO Prepaid, CNPS Volontaire)
Methode	POST
URL	/payments/subscription

POST /payments/subscription

{
  "userId": "user-uuid-123",
  "serviceId": "10042",
  "merchant": "CMENEOPREPAID",
  "serviceNumber": "20191953817",  // numero compteur ENEO
  "payItemId": "...",
  "amount": 5000,
  "phoneNumber": "237677389120",
  "customerName": "Jean Dupont"
}

Service	serviceId	merchant
ENEO Prepaid	10042	CMENEOPREPAID
CNPS Volontaire	10041	CMCNPS
 
4.8 Verification d'une transaction
Methode	GET
URL	/payments/verify?trid={trid}
Usage	Verifier le statut final d'une transaction PENDING

GET /payments/verify?trid=23fe94bc3b6f4893

// Reponse :
{
  "transaction": {
    "id": "a6e1edcc-...",
    "trid": "23fe94bc3b6f4893",
    "status": "SUCCESS",
    "amount": 5000,
    "ptn": "999991775613..."
  },
  "smobilpayStatus": { ... }
}

4.9 Historique des transactions d'un utilisateur
Methode	GET
URL	/payments/history/{userId}

GET /payments/history/user-uuid-123

// Reponse : tableau de transactions triees par date (plus recente en premier)
[
  { "id": "...", "type": "CASHIN", "amount": 5000, "status": "SUCCESS", ... },
  { "id": "...", "type": "CASHOUT", "amount": 2000, "status": "SUCCESS", ... }
]
 
5. Endpoints — Portefeuille (Wallet)
Le portefeuille est cree automatiquement lors du premier paiement de l'utilisateur. Il est credite apres chaque CashIn reussi et debite lors des CashOut, TopUp et paiements.
Endpoint	Description
GET /wallets/{userId}/balance	Obtenir le solde du portefeuille
GET /wallets/{userId}/history	Historique des transactions du portefeuille
GET /wallets	Lister tous les portefeuilles (admin)

Exemple — Solde
GET /wallets/user-uuid-123/balance

// Reponse :
{
  "userId": "user-uuid-123",
  "balance": 8000,
  "currency": "XAF"
}
 
6. Services disponibles — Reference complete
Pour obtenir les payItemId actifs d'un service, utilisez :
GET /payments/services/{type}/{serviceId}
ou type = cashin | cashout | product | voucher
Service	Type	serviceId	merchant	Numero de test
Canal+	PRODUCT	14021	CanalPlus2	23900419411616
StarTimes	PRODUCT	20021	CMStarTimes	02167682266
DSTV	PRODUCT	202301	NGDSTV	2005129242
Easy TV	PRODUCT	91006	CMEASYTV	61800120509092
Camwater	SEARCHABLE_BILL	90007	CAMWATER	010178181220101
ENEO Prepaid	SUBSCRIPTION	10042	CMENEOPREPAID	20191953817
ENEO Postpaid	SEARCHABLE_BILL	10039	ENEO	203157530
CNPS Obligatoire	SEARCHABLE_BILL	1004	CMCNPS	111-1111111-000-A
CNPS Volontaire	SUBSCRIPTION	10041	CMCNPS	357-1029517-8
Douanes	SEARCHABLE_BILL	202303	CMDOUANES	M061100036942Z
DGI Impots	SEARCHABLE_BILL	202302	CMDGI	DI000034PDFDF93
Camtel Recharge	TOPUP	20101	CMCamtel	242349577
Nexttel Recharge	TOPUP	20002	NXTL	661444448
Yoomee Recharge	TOPUP	20003	CMYooMee	242947689
MTN Recharge	TOPUP	20051	CMMTN	677389120
Orange Recharge	TOPUP	20062	CMORANGE	697707102
MTN Data	TOPUP	20041	CMMTNDATA	677389120
Express Union CashIn	CASHIN	30001	CMEXPRESSUNION	697707102
EU CashOut	CASHOUT	90010	EUCASHOUT	697707102
Orange Money CashIn	CASHIN	30052	CMORANGEOM	697707102
Orange Money CashOut	CASHOUT	30053	CMORANGEOM	697707102
MTN MoMo CashIn	CASHIN	20052	CMMTNMOMO	677389120
MTN MoMo CashOut	CASHOUT	20053	CMMTNMOMO	677389120
Yoomee Money CashIn	CASHIN	100237	CMYOOMEEMONEY	242254751
 
7. Codes d'erreur
HTTP	Message	Cause / Solution
400	Solde insuffisant	Le wallet n'a pas assez de fonds. Faire un CashIn d'abord.
400	Validation error	Un champ obligatoire manque ou format incorrect.
404	Transaction introuvable	Le trid ou id fourni n'existe pas en base.
404	Portefeuille introuvable	L'userId n'a pas encore de wallet (pas de transaction).
500	Internal server error	Erreur SmobilPay ou base de donnees. Verifier les logs.
 
8. Exemples complets — React Native
8.1 Service de paiement (PaymentService.js)
// src/services/PaymentService.js
import { API_BASE_URL } from '../config/api';

const headers = { 'Content-Type': 'application/json' };

export const PaymentService = {

  // Depot Mobile Money vers portefeuille
  async cashin({ userId, serviceId, payItemId, amount, phoneNumber, customerName }) {
    const res = await fetch(`${API_BASE_URL}/payments/cashin`, {
      method: 'POST', headers,
      body: JSON.stringify({ userId, serviceId, payItemId, amount, phoneNumber, customerName }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data; // { id, trid, status, ptn, amount, ... }
  },

  // Retrait vers Mobile Money
  async cashout({ userId, serviceId, payItemId, amount, destinationPhone, customerName }) {
    const res = await fetch(`${API_BASE_URL}/payments/cashout`, {
      method: 'POST', headers,
      body: JSON.stringify({ userId, serviceId, payItemId, amount, destinationPhone, customerName }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },

  // Solde du portefeuille
  async getBalance(userId) {
    const res = await fetch(`${API_BASE_URL}/wallets/${userId}/balance`);
    return res.json(); // { userId, balance, currency }
  },

  // Historique
  async getHistory(userId) {
    const res = await fetch(`${API_BASE_URL}/payments/history/${userId}`);
    return res.json();
  },

  // Verification statut
  async verify(trid) {
    const res = await fetch(`${API_BASE_URL}/payments/verify?trid=${trid}`);
    return res.json();
  },

  // Obtenir les services disponibles
  async getServiceInfo(type, serviceId) {
    // type: cashin | cashout | product | voucher
    const res = await fetch(`${API_BASE_URL}/payments/services/${type}/${serviceId}`);
    return res.json(); // tableau avec payItemId actifs
  },
};

8.2 Ecran CashIn (composant)
// src/screens/CashinScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { PaymentService } from '../services/PaymentService';

export default function CashinScreen({ userId }) {
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCashin = async () => {
    if (!amount || !phone) return Alert.alert('Erreur', 'Remplissez tous les champs');
    setLoading(true);
    try {
      const result = await PaymentService.cashin({
        userId,
        serviceId: '20052',  // MTN MoMo
        payItemId: 'S-112-948-MTNMOMO-20052-200040001-1',
        amount: parseInt(amount),
        phoneNumber: phone,
        customerName: 'Mon Nom',
      });
      Alert.alert('Succes', `Depot reussi ! PTN: ${result.ptn}`);
    } catch (err) {
      Alert.alert('Erreur', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <TextInput placeholder="Montant (XAF)" value={amount} onChangeText={setAmount} keyboardType="numeric" />
      <TextInput placeholder="Numero MTN (ex: 237677...)" value={phone} onChangeText={setPhone} />
      <TouchableOpacity onPress={handleCashin} disabled={loading}>
        {loading ? <ActivityIndicator /> : <Text>Deposer</Text>}
      </TouchableOpacity>
    </View>
  );
}
 
9. Exemples complets — React / Next.js
9.1 Hook usePayment (React)
// src/hooks/usePayment.js
import { useState } from 'react';
import api from '../lib/api';

export function usePayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cashin = async (payload) => {
    setLoading(true); setError(null);
    try {
      return await api.post('/payments/cashin', payload);
    } catch (err) {
      setError(err.message || 'Erreur de paiement');
      throw err;
    } finally { setLoading(false); }
  };

  const cashout = async (payload) => {
    setLoading(true); setError(null);
    try {
      return await api.post('/payments/cashout', payload);
    } catch (err) {
      setError(err.message); throw err;
    } finally { setLoading(false); }
  };

  const getBalance = (userId) => api.get(`/wallets/${userId}/balance`);
  const getHistory = (userId) => api.get(`/payments/history/${userId}`);
  const verify = (trid) => api.get(`/payments/verify?trid=${trid}`);

  return { cashin, cashout, getBalance, getHistory, verify, loading, error };
}

9.2 Composant WalletCard
// src/components/WalletCard.jsx
import { useEffect, useState } from 'react';
import { usePayment } from '../hooks/usePayment';

export default function WalletCard({ userId }) {
  const { getBalance } = usePayment();
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    getBalance(userId).then(setBalance);
  }, [userId]);

  return (
    <div className="wallet-card">
      <h3>Mon Portefeuille</h3>
      {balance ? (
        <p className="balance">
          {balance.balance.toLocaleString()} {balance.currency}
        </p>
      ) : <p>Chargement...</p>}
    </div>
  );
}

9.3 API Route Next.js (proxy securise)
// app/api/payments/cashin/route.js  (Next.js App Router)
export async function POST(request) {
  const body = await request.json();

  const response = await fetch(`${process.env.API_INTERNAL_URL}/payments/cashin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return Response.json(data, { status: response.status });
}
 
10. Codes de statut HTTP
Code	Signification	Quand
200	OK	Requete GET reussie
201	Created	Transaction creee avec succes (POST)
400	Bad Request	Champ manquant, solde insuffisant, numero invalide
404	Not Found	Transaction ou utilisateur introuvable
500	Internal Server Error	Erreur SmobilPay ou base de donnees

Statuts de transaction
Statut	Signification
PENDING	Transaction soumise, en attente de confirmation du client sur son telephone
SUCCESS	Transaction confirmee et traitee avec succes, PTN recu
FAILED	Transaction echouee (rejet client, solde insuffisant, timeout)
CANCELLED	Transaction annulee

