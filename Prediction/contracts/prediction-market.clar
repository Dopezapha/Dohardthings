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

;; Custom max function
(define-private (max (a uint) (b uint))
  (if (> a b) a b)
)

;; Helper function to safely get an element from a list or return a default value
(define-private (get-or-default (lst (list 20 uint)) (index uint) (default uint))
  (default-to default (element-at? lst index))
)

;; Custom take function
(define-private (take (n uint) (lst (list 20 uint)))
  (let ((length (len lst)))
    (if (>= n length)
      lst
      (concat (list) (unwrap-panic (slice? lst u0 n)))
    )
  )
)

;; Custom drop function
(define-private (drop (n uint) (lst (list 20 uint)))
  (let ((length (len lst)))
    (if (>= n length)
      (list)
      (concat (list) (unwrap-panic (slice? lst n length)))
    )
  )
)

;; Helper function to update a value at a specific index in a list
(define-private (update-list-at (lst (list 20 uint)) (index uint) (value uint))
  (let ((prefix (take index lst))
        (suffix (drop (+ index u1) lst)))
    (unwrap-panic (as-max-len? (concat (concat prefix (list value)) suffix) u20))
  )
)

;; Functions

;; Create a new prediction market
(define-public (create-prediction-market (query (string-ascii 256)) (details (string-ascii 1024)) (closing-block uint) (choices (list 20 (string-ascii 64))))
  (let
    (
      (prediction-id (var-get prediction-counter))
      (choice-count (len choices))
      (initial-totals (list u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0))
    )
    (asserts! (> choice-count u1) err-invalid-choice)
    (map-set prediction-markets
      { prediction-id: prediction-id }
      {
        query: query,
        details: details,
        closing-block: closing-block,
        result: none,
        option-totals: initial-totals,
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
      (existing-wager (default-to { option-amounts: (list u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0) } (map-get? wagers { prediction-id: prediction-id, participant: tx-sender })))
    )
    (asserts! (not (get is-finalized market)) err-already-finalized)
    (asserts! (not (get is-terminated market)) err-prediction-terminated)
    (asserts! (>= wager-amount minimum-wager) err-invalid-wager)
    (asserts! (<= wager-amount (stx-get-balance tx-sender)) err-insufficient-funds)
    (asserts! (< choice-index (len (get choices choices))) err-invalid-choice)
    
    (let
      (
        (current-option-total (get-or-default (get option-totals market) choice-index u0))
        (updated-option-total (+ current-option-total wager-amount))
        (updated-option-totals (update-list-at (get option-totals market) choice-index updated-option-total))
        (current-wager-amount (get-or-default (get option-amounts existing-wager) choice-index u0))
        (updated-wager-amount (+ current-wager-amount wager-amount))
        (updated-wager-amounts (update-list-at (get option-amounts existing-wager) choice-index updated-wager-amount))
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
        (current-wager-amount (get-or-default (get option-amounts participant-wager) choice-index u0))
      )
      (asserts! (>= current-wager-amount withdrawal-amount) err-invalid-wager)
      
      (let
        (
          (updated-option-totals (update-list-at (get option-totals market) choice-index (- (get-or-default (get option-totals market) choice-index u0) withdrawal-amount)))
          (updated-wager-amounts (update-list-at (get option-amounts participant-wager) choice-index (- current-wager-amount withdrawal-amount)))
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
          (winning-amount (get-or-default (get option-amounts participant-wager) result-index u0))
          (total-winning-pool (get-or-default (get option-totals market) result-index u0))
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
(define-public (auto-finalize-predictions (max-iterations uint))
  (let
    (
      (current-prediction-id (var-get prediction-counter))
      (initial-state { current-id: u0, max-id: current-prediction-id, iterations-left: max-iterations })
    )
    (ok (get current-id (fold auto-finalize-loop 
                              (list initial-state)
                              initial-state)))
  )
)

(define-private (auto-finalize-loop 
  (current-state { current-id: uint, max-id: uint, iterations-left: uint }) 
  (acc { current-id: uint, max-id: uint, iterations-left: uint })
)
  (let (
    (current-id (get current-id current-state))
    (max-id (get max-id current-state))
    (iterations-left (get iterations-left current-state))
  )
    (if (and (< current-id max-id) (> iterations-left u0))
      (let
        (
          (market (map-get? prediction-markets { prediction-id: current-id }))
        )
        (if (is-some market)
          (let
            (
              (finalized (match market market-data (finalize-if-due current-id market-data) false))
            )
            { 
              current-id: (+ current-id u1),
              max-id: max-id,
              iterations-left: (- iterations-left u1)
            }
          )
          { 
            current-id: (+ current-id u1),
            max-id: max-id,
            iterations-left: (- iterations-left u1)
          }
        )
      )
      current-state
    )
  )
)

(define-private (finalize-if-due (prediction-id uint) (market { query: (string-ascii 256), details: (string-ascii 1024), closing-block: uint, result: (optional uint), option-totals: (list 20 uint), is-finalized: bool, is-terminated: bool }))
  (if (and (>= block-height (get closing-block market)) (not (get is-finalized market)) (not (get is-terminated market)))
    (let
      (
        (winning-choice (find-winning-choice (get option-totals market)))
      )
      (map-set prediction-markets 
        { prediction-id: prediction-id }
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