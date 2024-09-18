;; Prediction Market Smart Contract

;; Define constants
(define-constant contract-admin tx-sender)
(define-constant minimum-wager u100000) ;; Minimum wager amount (100,000 microSTX)
(define-constant commission-rate u2) ;; 2% commission

;; Define data maps
(define-map prediction-markets
  { prediction-id: uint }
  {
    query: (string-ascii 256),
    details: (string-ascii 1024),
    closing-block: uint,
    result: (optional uint),
    option-totals: (list 20 uint),
    is-finalized: bool,
    is-terminated: bool
  }
)

(define-map wagers
  { prediction-id: uint, participant: principal }
  {
    option-amounts: (list 20 uint)
  }
)

(define-map prediction-choices
  { prediction-id: uint }
  {
    choices: (list 20 (string-ascii 64))
  }
)

;; Define variables
(define-data-var prediction-counter uint u0)

;; Error constants
(define-constant err-not-authorized (err u100))
(define-constant err-already-finalized (err u101))
(define-constant err-not-finalized (err u102))
(define-constant err-invalid-wager (err u103))
(define-constant err-insufficient-funds (err u104))
(define-constant err-prediction-terminated (err u105))
(define-constant err-invalid-choice (err u106))

;; Functions

;; Create a new prediction market
(define-public (create-prediction-market (query (string-ascii 256)) (details (string-ascii 1024)) (closing-block uint) (choices (list 20 (string-ascii 64))))
  (let
    (
      (prediction-id (var-get prediction-counter))
    )
    (asserts! (> (len choices) u1) err-invalid-choice)
    (map-set prediction-markets
      { prediction-id: prediction-id }
      {
        query: query,
        details: details,
        closing-block: closing-block,
        result: none,
        option-totals: (list-repeat u0 (len choices)),
        is-finalized: false,
        is-terminated: false
      }
    )
    (map-set prediction-choices
      { prediction-id: prediction-id }
      {
        choices: choices
      }
    )
    (var-set prediction-counter (+ prediction-id u1))
    (ok prediction-id)
  )
)

;; Place a wager on a prediction market
(define-public (place-wager (prediction-id uint) (choice-index uint) (wager-amount uint))
  (let
    (
      (market (unwrap! (map-get? prediction-markets { prediction-id: prediction-id }) (err u404)))
      (choices (unwrap! (map-get? prediction-choices { prediction-id: prediction-id }) (err u404)))
      (existing-wager (default-to { option-amounts: (list-repeat u0 (len (get choices choices))) } (map-get? wagers { prediction-id: prediction-id, participant: tx-sender })))
    )
    (asserts! (not (get is-finalized market)) err-already-finalized)
    (asserts! (not (get is-terminated market)) err-prediction-terminated)
    (asserts! (>= wager-amount minimum-wager) err-invalid-wager)
    (asserts! (<= wager-amount (stx-get-balance tx-sender)) err-insufficient-funds)
    (asserts! (< choice-index (len (get choices choices))) err-invalid-choice)
    
    (let
      (
        (updated-option-totals (replace-at? (get option-totals market) choice-index (+ (unwrap! (element-at? (get option-totals market) choice-index) err-invalid-choice) wager-amount)))
        (updated-wager-amounts (replace-at? (get option-amounts existing-wager) choice-index (+ (unwrap! (element-at? (get option-amounts existing-wager) choice-index) err-invalid-choice) wager-amount)))
      )
      (map-set prediction-markets { prediction-id: prediction-id }
        (merge market { option-totals: updated-option-totals })
      )
      
      (map-set wagers
        { prediction-id: prediction-id, participant: tx-sender }
        { option-amounts: updated-wager-amounts }
      )
      
      (stx-transfer? wager-amount tx-sender (as-contract tx-sender))
    )
  )
)

;; Finalize a prediction market
(define-public (finalize-prediction-market (prediction-id uint) (result-index uint))
  (let
    (
      (market (unwrap! (map-get? prediction-markets { prediction-id: prediction-id }) (err u404)))
      (choices (unwrap! (map-get? prediction-choices { prediction-id: prediction-id }) (err u404)))
    )
    (asserts! (is-eq tx-sender contract-admin) err-not-authorized)
    (asserts! (not (get is-finalized market)) err-already-finalized)
    (asserts! (not (get is-terminated market)) err-prediction-terminated)
    (asserts! (>= block-height (get closing-block market)) err-not-authorized)
    (asserts! (< result-index (len (get choices choices))) err-invalid-choice)
    
    (map-set prediction-markets { prediction-id: prediction-id }
      (merge market {
        result: (some result-index),
        is-finalized: true
      })
    )
    (ok true)
  )
)

;; Terminate a prediction market
(define-public (terminate-prediction-market (prediction-id uint))
  (let
    (
      (market (unwrap! (map-get? prediction-markets { prediction-id: prediction-id }) (err u404)))
    )
    (asserts! (is-eq tx-sender contract-admin) err-not-authorized)
    (asserts! (not (get is-finalized market)) err-already-finalized)
    (asserts! (not (get is-terminated market)) err-prediction-terminated)
    
    (map-set prediction-markets { prediction-id: prediction-id }
      (merge market {
        is-terminated: true
      })
    )
    (ok true)
  )
)

;; Withdraw partial wager before prediction market finalization
(define-public (withdraw-partial-wager (prediction-id uint) (choice-index uint) (withdrawal-amount uint))
  (let
    (
      (market (unwrap! (map-get? prediction-markets { prediction-id: prediction-id }) (err u404)))
      (participant-wager (unwrap! (map-get? wagers { prediction-id: prediction-id, participant: tx-sender }) (err u404)))
    )
    (asserts! (not (get is-finalized market)) err-already-finalized)
    (asserts! (not (get is-terminated market)) err-prediction-terminated)
    (asserts! (< choice-index (len (get option-amounts participant-wager))) err-invalid-choice)
    (let
      (
        (current-wager-amount (unwrap! (element-at? (get option-amounts participant-wager) choice-index) err-invalid-choice))
      )
      (asserts! (>= current-wager-amount withdrawal-amount) err-invalid-wager)
      
      (let
        (
          (updated-option-totals (replace-at? (get option-totals market) choice-index (- (unwrap! (element-at? (get option-totals market) choice-index) err-invalid-choice) withdrawal-amount)))
          (updated-wager-amounts (replace-at? (get option-amounts participant-wager) choice-index (- current-wager-amount withdrawal-amount)))
        )
        (map-set prediction-markets { prediction-id: prediction-id }
          (merge market { option-totals: updated-option-totals })
        )
        
        (map-set wagers
          { prediction-id: prediction-id, participant: tx-sender }
          { option-amounts: updated-wager-amounts }
        )
        
        (as-contract (stx-transfer? withdrawal-amount (as-contract tx-sender) tx-sender))
      )
    )
  )
)

;; Claim winnings or refund
(define-public (claim-payout-or-refund (prediction-id uint))
  (let
    (
      (market (unwrap! (map-get? prediction-markets { prediction-id: prediction-id }) (err u404)))
      (participant-wager (unwrap! (map-get? wagers { prediction-id: prediction-id, participant: tx-sender }) (err u404)))
    )
    (asserts! (or (get is-finalized market) (get is-terminated market)) err-not-finalized)
    
    (if (get is-terminated market)
      (let
        (
          (refund-amount (fold + (get option-amounts participant-wager) u0))
        )
        (map-delete wagers { prediction-id: prediction-id, participant: tx-sender })
        (as-contract (stx-transfer? refund-amount (as-contract tx-sender) tx-sender))
      )
      (let
        (
          (result-index (unwrap! (get result market) err-not-finalized))
          (winning-amount (unwrap! (element-at? (get option-amounts participant-wager) result-index) err-invalid-choice))
          (total-winning-pool (unwrap! (element-at? (get option-totals market) result-index) err-invalid-choice))
          (total-pool (fold + (get option-totals market) u0))
          (payout (/ (* winning-amount total-pool) total-winning-pool))
          (commission (/ (* payout commission-rate) u100))
          (final-payout (- payout commission))
        )
        (map-delete wagers { prediction-id: prediction-id, participant: tx-sender })
        (as-contract (stx-transfer? final-payout (as-contract tx-sender) tx-sender))
      )
    )
  )
)

;; Time-based automatic finalization (this function should be called periodically)
(define-public (auto-finalize-predictions)
  (let
    (
      (current-block block-height)
    )
    (filter finalize-if-due
      (map-to-list prediction-markets)
    )
  )
)

(define-private (finalize-if-due (market { prediction-id: uint, query: (string-ascii 256), details: (string-ascii 1024), closing-block: uint, result: (optional uint), option-totals: (list 20 uint), is-finalized: bool, is-terminated: bool }))
  (if (and (>= block-height (get closing-block market)) (not (get is-finalized market)) (not (get is-terminated market)))
    (let
      (
        (winning-choice (find-winning-choice (get option-totals market)))
      )
      (map-set prediction-markets { prediction-id: (get prediction-id market) }
        (merge market {
          result: (some winning-choice),
          is-finalized: true
        })
      )
      true
    )
    false
  )
)

(define-private (find-winning-choice (amounts (list 20 uint)))
  (let
    (
      (highest-amount (fold max amounts u0))
    )
    (unwrap-panic (index-of amounts highest-amount))
  )
)

;; Read-only functions

;; Get prediction market details
(define-read-only (get-prediction-market (prediction-id uint))
  (map-get? prediction-markets { prediction-id: prediction-id })
)

;; Get prediction market choices
(define-read-only (get-prediction-choices (prediction-id uint))
  (map-get? prediction-choices { prediction-id: prediction-id })
)

;; Get wager details
(define-read-only (get-participant-wager (prediction-id uint) (participant principal))
  (map-get? wagers { prediction-id: prediction-id, participant: participant })
)

;; Get contract balance
(define-read-only (get-contract-balance)
  (stx-get-balance (as-contract tx-sender))
)