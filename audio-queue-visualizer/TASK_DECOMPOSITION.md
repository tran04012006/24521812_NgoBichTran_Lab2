TASK 1 — PROJECT FOUNDATION
│
├── Step 1: Project Initialization
│ ├── Check Node.js and npm
│ ├── Initialize React + TypeScript + Vite
│ ├── Remove unnecessary boilerplate code
│ └── Verify the application runs successfully
│
├── Step 2: Project Architecture
│ ├── Create the components/ folder
│ ├── Create the services/ folder
│ ├── Create the types/ folder
│ ├── Create the hooks/ folder
│ └── Create the styles/ folder
│
├── Step 3: TypeScript Contracts
│ ├── Define AudioTrack
│ ├── Define AudioTask
│ └── Define QueueStatus
│
├── Step 4: Build Static UI
│ ├── AudioPlayer
│ ├── TrackQueue
│ └── AudioVisualizer
│
└── Step 5: Integration & Verification
├── Connect the components
├── Run the TypeScript check
├── Verify the UI
└── Git commit
TASK 2 — FIFO QUEUE ENGINE
│
├── Step 1 — Core FIFO Queue
│ ├── Queue Data Structure
│ ├── Enqueue
│ ├── Dequeue / Processing Loop
│ ├── Single Consumer
│ └── Promise Resolution
│
├── Step 2 — Task Lifecycle
│ ├── Pending → Processing
│ ├── Processing → Completed
│ ├── Processing → Failed
│ ├── Processing → Cancelled
│ └── Queue State Notifications
│
├── Step 3 — Cancellation
│ ├── Cancel Pending Task
│ ├── Cancel Active Task
│ ├── AbortController
│ └── Prevent Stale Results
│
├── Step 4 — React Integration
│ ├── useAudioQueue Hook
│ ├── Queue State Subscription
│ ├── Enqueue Controls
│ └── Live Queue UI
│
└── Step 5 — Testing & Verification
├── FIFO Order
├── Concurrent Enqueue
├── Promise Settlement
├── Failure Recovery
└── Cancellation Tests
TASK 3 — AUDIO LOADING & DECODING
│
├── Step 1 — Web Audio API Foundation
│ ├── AudioContext
│ ├── fetch() audio file
│ ├── decodeAudioData()
│ ├── AbortSignal
│ └── Test audio decoding
│
├── Step 2 — Real Audio Processor
│ ├── Connect AudioEngine to FIFO Queue
│ ├── Replace Mock Processor
│ ├── Handle network errors
│ └── Handle decoding errors
│
├── Step 3 — AudioContext Lifecycle
│ ├── Manage shared AudioContext
│ ├── Initialize on demand
│ ├── Prevent resource leaks
│ └── Close AudioContext safely
│
├── Step 4 — Audio Playback Integration
│ ├── AudioBufferSourceNode
│ ├── Play / Stop
│ ├── Playback State
│ └── Audio Node Cleanup
│
└── Step 5 — Testing & Verification
├── Real audio loading
├── Invalid audio files
├── Cancellation
├── Cleanup
└── Build & integration tests
TASK 4 — FFT AUDIO VISUALIZER
│
├── STEP 1 — FFT & AnalyserNode Foundation
│ ├── Hiểu FFT và Frequency Bins
│ ├── Tạo AnalyserNode
│ ├── Cấu hình fftSize = 256
│ ├── Kết nối Audio Graph
│ └── Đọc Frequency Data
│
├── STEP 2 — React & Audio Analyzer Integration
│ ├── Cập nhật useAudioQueue
│ ├── Expose getFrequencyData
│ ├── Kết nối AudioEngine với UI
│ └── Quản lý Playback State
│
├── STEP 3 — Real-Time Canvas Visualizer
│ ├── Loại bỏ Static Frequency Bars
│ ├── Sử dụng requestAnimationFrame
│ ├── Đọc dữ liệu tần số liên tục
│ ├── Vẽ các Frequency Bars
│ └── Cleanup Animation Loop
│
├── STEP 4 — Performance & Memory Safety
│ ├── Tránh React State Thrashing
│ ├── Tái sử dụng Uint8Array
│ ├── Ngừng Animation khi Stop
│ ├── Cleanup AnalyserNode
│ ├── Responsive Canvas
│ └── Target 60fps
│
└── STEP 5 — Testing & Final Verification
├── FFT Configuration Tests
├── Audio Graph Connection Tests
├── Frequency Data Tests
├── Animation Cleanup Tests
├── FIFO Regression Tests
├── Performance Verification
└── Git Commit
