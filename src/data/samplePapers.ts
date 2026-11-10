import { ResearchAnalysisResult } from '../types/research.js';

export const SAMPLE_PAPERS: ResearchAnalysisResult[] = [
  {
    id: 'sample-attention-is-all-you-need',
    paper: {
      title: 'Attention Is All You Need',
      authors: [
        'Ashish Vaswani',
        'Noam Shazeer',
        'Niki Parmar',
        'Jakob Uszkoreit',
        'Llion Jones',
        'Aidan N. Gomez',
        'Lukasz Kaiser',
        'Illia Polosukhin'
      ],
      year: 2017,
      url: 'https://arxiv.org/abs/1706.03762',
      abstract:
        'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train.',
      venue: 'Advances in Neural Information Processing Systems (NeurIPS 2017)'
    },
    coreConcepts: {
      problemStatement:
        'Sequential computation in Recurrent Neural Networks (RNNs, LSTMs, GRUs) precludes parallelization during training, imposing substantial compute bottlenecks and leading to vanishing gradients over long context dependencies.',
      methodology:
        'Replaces recurrence entirely with Multi-Head Scaled Dot-Product Self-Attention and sinusoidal positional encodings, enabling simultaneous processing of all token positions across feed-forward stacks.',
      keyBreakthroughs: [
        'Scaled Dot-Product Attention: Computes attention weights via softmax((Q * K^T) / sqrt(d_k)) * V.',
        'Multi-Head Attention: Projects queries, keys, and values into multiple representation subspaces.',
        'Sinusoidal Positional Encodings: Injects sequence order without recurrence.',
        'Encoder-Decoder Attention Stacks: Eliminates sequential bottlenecks and achieves state-of-the-art BLEU scores.'
      ],
      summary:
        'The Transformer architecture revolutionizes deep learning for sequential data. Traditional models like LSTMs read sentences word by word, making training slow and memory-intensive. Transformers eliminate sequential loops by looking at all words simultaneously using Self-Attention, calculating mathematical relationships between every token in parallel. By introducing Multi-Head Attention and positional signals, it allows machines to learn complex syntactic and semantic dependencies in a fraction of the training time.',
      whyItMatters:
        'It forms the universal architectural foundation for virtually all modern Generative AI, Large Language Models (LLMs), and foundation vision models (Vision Transformers).',
      importantAlgorithms: [
        'Scaled Dot-Product Attention: Attention(Q,K,V) = softmax(Q K^T / sqrt(d_k)) V',
        'MultiHead(Q,K,V) = Concat(head_1, ..., head_h) W^O',
        'Layer Normalization & Residual Connections: LayerNorm(x + Sublayer(x))'
      ],
      mainContributions: [
        'Demonstrated that self-attention alone is sufficient for sequence transduction without RNNs or CNNs.',
        'Established parallelized training on GPU clusters, achieving state-of-the-art translation with 3.5 days of training.'
      ]
    },
    architecture: {
      description:
        'The Transformer follows an Encoder-Decoder paradigm. The Encoder converts input sequence tokens into continuous representations through 6 identical stacked layers, each consisting of Multi-Head Self-Attention followed by Position-wise Feed-Forward Networks with residual connections and layer normalization. The Decoder inserts a third sub-layer of Masked Multi-Head Attention to prevent positions from attending to subsequent tokens, preserving auto-regressive properties.',
      mermaidCode: `graph TD
  A["Input Tokens & Target Shifted Tokens"] --> B["Input & Output Embeddings"]
  B --> C["Add Positional Encodings"]
  
  subgraph EncoderStack ["Encoder Stack (N=6 Layers)"]
    C --> D["Multi-Head Self-Attention"]
    D --> E["Add & Layer Norm"]
    E --> F["Feed-Forward Network (FFN)"]
    F --> G["Add & Layer Norm"]
  end
  
  subgraph DecoderStack ["Decoder Stack (N=6 Layers)"]
    C --> H["Masked Multi-Head Self-Attention"]
    H --> I["Add & Layer Norm"]
    G --> J["Encoder-Decoder Multi-Head Cross-Attention"]
    I --> J
    J --> K["Add & Layer Norm"]
    K --> L["Feed-Forward Network"]
    L --> M["Add & Layer Norm"]
  end
  
  M --> N["Linear Projection Layer"]
  N --> O["Softmax Probability Output"]
  O --> P["Target Next-Token Prediction"]`
    },
    futureWork: [
      {
        title: 'FlashLinear: Kernel-Level Attention Optimization for Edge Inference',
        extension:
          'Implement a fused CUDA / Triton kernel replacing standard scaled dot-product attention with block-sparse FlashAttention-v2 and 4-bit INT4 quantization for local CPU/Edge execution.',
        problemSolved:
          'Standard full attention computes an O(N^2) memory footprint, resulting in out-of-memory errors on consumer GPUs and laptops for sequences exceeding 4,096 tokens.',
        implementationApproach:
          'Develop a custom PyTorch C++/CUDA extension using tiling and online softmax calculation to eliminate intermediate attention matrix materialization in High Bandwidth Memory (HBM). Benchmark against HuggingFace standard attention.',
        targetMetric: '65% reduction in GPU VRAM consumption and 2.8x speedup in forward-pass token generation latency.',
        technologyStack: ['PyTorch', 'Triton', 'CUDA C++', 'FastAPI', 'Docker', 'Google Benchmark'],
        difficulty: 'Advanced',
        portfolioDemonstration:
          'Deploy an interactive web-based comparison tool with real-time latency graphs, memory profiling waterfall charts, and open-source GitHub repository with automated GitHub Actions benchmark CI.'
      },
      {
        title: 'Rotary Position Embedding (RoPE) Drop-In Modular Extension',
        extension:
          'Replace static sinusoidal positional encodings with dynamic Rotary Position Embeddings (RoPE) with YaRN context length extension.',
        problemSolved:
          'Original Transformer sinusoidal encodings decay in extrapolation capability when tested on sequence lengths longer than those observed during training.',
        implementationApproach:
          'Re-implement the encoder attention query-key projection layer to apply complex 2D orthogonal rotations. Train a lightweight Transformer on Wikitext-103 and evaluate perplexity up to 8k context.',
        targetMetric: 'Preserve perplexity < 22.0 on 2x training context length without fine-tuning.',
        technologyStack: ['Python', 'PyTorch', 'HuggingFace Transformers', 'Weights & Biases'],
        difficulty: 'Intermediate',
        portfolioDemonstration:
          'Showcase an interactive ablation study report comparing attention maps and perplexity curves across context lengths in an interview presentation.'
      },
      {
        title: 'Real-Time Attention Head Interpretability & Pruning Dashboard',
        extension:
          'Build an interactive visual probe that extracts attention matrix weights across all 8 heads, detects redundant heads using Jensen-Shannon divergence, and dynamically prunes heads at inference time.',
        problemSolved:
          'Transformers act as black boxes; redundant attention heads waste up to 30% of FLOPs on trivial uniform or diagonal attention patterns.',
        implementationApproach:
          'Hook into PyTorch module forward passes to capture attention matrices; stream head activation maps via WebSocket to a React + D3.js dashboard with a slider to test head-pruning accuracy degradation.',
        targetMetric: 'Prune 25% of attention heads with less than 0.5 BLEU score degradation.',
        technologyStack: ['React', 'TypeScript', 'D3.js', 'PyTorch', 'FastAPI', 'TailwindCSS'],
        difficulty: 'Intermediate',
        portfolioDemonstration:
          'Demonstrate live token attention routing in an interview and explain multi-head specialization (syntactic heads vs. delimiter heads).'
      }
    ],
    references: [
      {
        title: 'Attention-based Models for Speech Recognition',
        authors: 'Chorowski et al.',
        year: 2015,
        citation: 'NeurIPS 2015',
        relevance: 'Early foundations of attention mechanisms in sequence modeling.'
      },
      {
        title: 'Neural Machine Translation by Jointly Learning to Align and Translate',
        authors: 'Bahdanau et al.',
        year: 2014,
        citation: 'ICLR 2015',
        relevance: 'The seminal additive attention mechanism paper.'
      },
      {
        title: 'Layer Normalization',
        authors: 'Ba, Kiros, Hinton',
        year: 2016,
        citation: 'arXiv:1607.06450',
        relevance: 'Normalization technique used across Transformer sublayers.'
      }
    ],
    metadata: {
      generatedAt: '2024-03-01T10:00:00.000Z',
      sourceType: 'sample_paper',
      modelUsed: 'gemini-2.5-flash',
      supplementaryWebResearchUsed: true
    }
  },
  {
    id: 'sample-lora-low-rank-adaptation',
    paper: {
      title: 'LoRA: Low-Rank Adaptation of Large Language Models',
      authors: [
        'Edward J. Hu',
        'Yelong Shen',
        'Phillip Wallis',
        'Zeyuan Allen-Zhu',
        'Yuanzhi Li',
        'Shean Wang',
        'Lu Wang',
        'Weizhu Chen'
      ],
      year: 2021,
      url: 'https://arxiv.org/abs/2106.09685',
      abstract:
        'An important paradigm of natural language processing consists of large-scale pre-training on general domain data and adaptation to particular tasks or domains. As we pre-train larger models, full fine-tuning, which retrains all model parameters, becomes less feasible. We propose Low-Rank Adaptation, or LoRA, which freezes the pre-trained model weights and injects trainable rank decomposition matrices into each layer of the Transformer architecture, greatly reducing the number of trainable parameters for downstream tasks. LoRA can reduce the number of trainable parameters by 10,000 times and the GPU memory requirement by 3 times.',
      venue: 'International Conference on Learning Representations (ICLR 2022)'
    },
    coreConcepts: {
      problemStatement:
        'Full parameter fine-tuning of massive LLMs requires storing entire duplicate model checkpoints per task (e.g., 70GB+ per fine-tune), creating prohibitive VRAM demands and deployment bottlenecks.',
      methodology:
        'Freezes pre-trained weight matrices W_0 and models weight updates delta_W as a low-rank decomposition product B * A, where B is (d x r) initialized to zero and A is (r x k) initialized from a Gaussian distribution, with r << min(d, k).',
      keyBreakthroughs: [
        'Intrinsic Low-Rank Hypothesis: Validates that weight updates during downstream task adaptation have a very low intrinsic dimension.',
        'Zero Inference Latency Overhead: Adapters can be mathematically merged into base weights: W = W_0 + (alpha / r) * B * A.',
        'Parameter Reduction: Reduces trainable parameters by up to 10,000x and GPU VRAM requirements by 3x.',
        'Multi-Tenant Task Switching: Allows swapping 20MB adapter weights on the fly on a single frozen base model server.'
      ],
      summary:
        'LoRA solves the massive cost of personalizing large AI models. Normally, tweaking an LLM requires retraining billions of numbers, demanding giant supercomputers. LoRA realizes that when adapting a model to a new task, most weights don’t need to change independently. Instead of changing a huge grid of numbers, LoRA adds two tiny matrices whose multiplication approximates the changes. By freezing the original model and training only these tiny side-matrices, it shrinks fine-tuning memory by up to 75% and creates tiny adapter files that can be shared in seconds.',
      whyItMatters:
        'Enabled the modern open-source democratized AI ecosystem, allowing consumer GPUs and individual developers to fine-tune state-of-the-art models.',
      importantAlgorithms: [
        'Forward Pass: h = W_0 x + delta_W x = W_0 x + (alpha / r) B A x',
        'Weight Merging: W_deployed = W_0 + (alpha / r) B A',
        'Rank Selection Heuristic: r in {4, 8, 16, 64}'
      ],
      mainContributions: [
        'Introduced parameter-efficient fine-tuning via matrix rank decomposition.',
        'Showed performance matching or exceeding full fine-tuning with 0.01% trainable parameters.'
      ]
    },
    architecture: {
      description:
        'During training, the pre-trained weight matrix W_0 in Transformer attention projection layers is frozen. Input vector x is passed simultaneously to W_0 and the LoRA branch. In the LoRA branch, x is compressed from dimension d to rank r via matrix A, then projected back from r to k via matrix B, multiplied by scaling factor alpha/r, and added to the frozen output.',
      mermaidCode: `graph TD
  A["Input Activation Vector x (Dimension d)"] --> B["Frozen Pre-trained Weights W_0 (d x k)"]
  A --> C["LoRA Down-Projection Matrix A (d x r, Gaussian Init)"]
  
  C --> D["Low-Rank Bottleneck Dimension r (e.g. r=8)"]
  D --> E["LoRA Up-Projection Matrix B (r x k, Zero Init)"]
  
  E --> F["Scaling Factor (alpha / r)"]
  
  B --> G["Summation Node (+)"]
  F --> G
  
  G --> H["Combined Output Activation h = W_0*x + (alpha/r)*B*A*x"]
  
  subgraph DeploymentOption ["Zero-Latency Inference Mode"]
    H -.-> I["Permanent Weight Merge: W_merged = W_0 + (alpha/r)*B*A"]
    I -.-> J["Standard Single GEMM Forward Pass"]
  end`
    },
    futureWork: [
      {
        title: 'Dynamic-Rank LoRA (DyRank): Adaptive Layer Rank Allocation',
        extension:
          'Implement an automated sensitivity-driven algorithm that dynamically allocates higher ranks (r=16) to critical MLP layers and lower ranks (r=2) to redundant attention projection layers.',
        problemSolved:
          'Standard LoRA applies a uniform rank r across all layers, wasting parameters on insensitive layers while bottlenecking complex reasoning layers.',
        implementationApproach:
          'Compute gradient norm magnitude or Fisher Information Matrix trace per layer during the initial 100 training steps, dynamically repartitioning matrix shapes before committing weights.',
        targetMetric: '18% faster training convergence and 35% fewer total trainable parameters with equivalent GSM8k accuracy.',
        technologyStack: ['PyTorch', 'HuggingFace PEFT', 'Optuna', 'Weights & Biases'],
        difficulty: 'Intermediate',
        portfolioDemonstration:
          'Provide a Jupyter notebook walkthrough with interactive layer-wise rank heatmaps demonstrating parameter efficiency during an interview.'
      },
      {
        title: 'EdgeLoRA: On-Device Browser Fine-Tuning via WebGPU & ONNX',
        extension:
          'Port LoRA forward and backward gradient passes to WebGPU using ONNX Runtime Web, enabling private user-specific model personalization entirely inside Google Chrome.',
        problemSolved:
          'Fine-tuning currently requires centralized cloud servers, raising data privacy concerns for sensitive medical, legal, or personal text.',
        implementationApproach:
          'Compile a quantized small language model (e.g. SmolLM or Phi-3) to ONNX with exposed LoRA projection tensors. Implement SGD/Adam optimizer shaders in WGSL (WebGPU Shading Language).',
        targetMetric: 'Fine-tune a 1.5B model on 500 examples in under 4 minutes on a consumer MacBook/Windows GPU inside the browser.',
        technologyStack: ['TypeScript', 'WebGPU', 'ONNX Runtime Web', 'React', 'Vite'],
        difficulty: 'Advanced',
        portfolioDemonstration:
          'Host a live browser demo where interviewers can paste their resume and watch their local browser train a custom adapter in real-time with zero server backend.'
      },
      {
        title: 'Multi-LoRA Dynamic Routing Gateway for Production APIs',
        extension:
          'Build an asynchronous FastAPI reverse proxy that dynamically hot-swaps multiple specialized LoRA adapters (code, legal, medical) onto a single batched vLLM instance.',
        problemSolved:
          'Hosting 10 distinct fine-tuned models requires 10 GPU instances ($10,000+/mo); Multi-LoRA multiplexing serves all 10 tasks from one GPU.',
        implementationApproach:
          'Use vLLM Multi-LoRA backend with PagedAttention; implement request header routing (\`X-Task-Adapter: legal\`) and caching in Redis.',
        targetMetric: 'Serve 15 concurrent specialized tasks on a single A10G GPU with < 5ms adapter-switch overhead.',
        technologyStack: ['FastAPI', 'vLLM', 'Redis', 'Docker', 'Python', 'Prometheus'],
        difficulty: 'Intermediate',
        portfolioDemonstration:
          'Deploy a multi-tenant demo dashboard simulating 50 concurrent mixed-task requests with live latency and GPU utilization telemetry.'
      }
    ],
    references: [
      {
        title: 'Prefix-Tuning: Optimizing Continuous Prompts for Generation',
        authors: 'Li & Liang',
        year: 2021,
        citation: 'ACL 2021',
        relevance: 'Prior parameter-efficient approach prepending virtual prompt tokens.'
      },
      {
        title: 'Parameter-Efficient Transfer Learning for NLP',
        authors: 'Houlsby et al.',
        year: 2019,
        citation: 'ICML 2019',
        relevance: 'Original serial adapter architecture for Transformers.'
      },
      {
        title: 'Intrinsic Dimensionality Explains the Effectiveness of Language Model Fine-Tuning',
        authors: 'Aghajanyan et al.',
        year: 2020,
        citation: 'ACL 2021',
        relevance: 'Theoretical foundation proving low intrinsic dimension of task updates.'
      }
    ],
    metadata: {
      generatedAt: '2024-03-01T12:00:00.000Z',
      sourceType: 'sample_paper',
      modelUsed: 'gemini-2.5-flash',
      supplementaryWebResearchUsed: true
    }
  },
  {
    id: 'sample-resnet-deep-residual-learning',
    paper: {
      title: 'Deep Residual Learning for Image Recognition',
      authors: ['Kaiming He', 'Xiangyu Zhang', 'Shaoqing Ren', 'Jian Sun'],
      year: 2015,
      url: 'https://arxiv.org/abs/1512.03385',
      abstract:
        'Deeper neural networks are more difficult to train. We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously. We explicitly reformulate the layers as learning residual functions with reference to the layer inputs, instead of learning unreferenced functions. We provide comprehensive empirical evidence showing that these networks are easier to optimize, and can gain accuracy from considerably increased depth. On the ImageNet dataset we evaluate residual nets with a depth of up to 152 layers---8x deeper than VGG nets but still having lower complexity.',
      venue: 'IEEE Conference on Computer Vision and Pattern Recognition (CVPR 2016 - Best Paper)'
    },
    coreConcepts: {
      problemStatement:
        'When deep networks start converging, a degradation problem is exposed: as network depth increases, accuracy saturates and then degrades rapidly, caused not by overfitting but by vanishing/exploding optimization gradients.',
      methodology:
        'Introduces identity shortcut connections that bypass one or more layers, reformulating layers to learn a residual mapping F(x) = H(x) - x, where the original desired mapping is H(x) = F(x) + x.',
      keyBreakthroughs: [
        'Identity Shortcut Mapping: Allows gradients to flow directly back through the computational graph without attenuation.',
        'Residual Formulation: It is mathematically easier to push residual F(x) to zero than to learn an identity mapping through nonlinear weights.',
        'Bottleneck Architecture: 1x1 convolutions reduce and then restore dimensions, enabling 152+ layer networks with low FLOP counts.',
        'Won 1st place in ImageNet 2015 with a top-5 error of 3.57%, surpassing human-level vision.'
      ],
      summary:
        'ResNet solved the puzzle of making neural networks super deep. Before ResNet, stacking more than 20 layers made AI perform worse because signals and learning instructions faded away across layers (the vanishing gradient problem). He et al. realized a simple yet brilliant trick: add "shortcut bridges" that let data skip over layers and add directly to the output. If a layer isn’t helping, the network can easily learn to do nothing (set the layer to zero) while the information passes straight through. This let researchers scale networks to 152 layers and beyond, unlocking modern computer vision.',
      whyItMatters:
        'The skip/residual connection concept is now standard in almost every major modern architecture, including Transformers, ConvNeXt, and Diffusion models.',
      importantAlgorithms: [
        'Residual Block: y = F(x, {W_i}) + x',
        'Bottleneck Block: 1x1 conv (reduce), 3x3 conv, 1x1 conv (restore) + identity x',
        'He Initialization: Standard deviation sqrt(2 / n_in) for ReLU activation'
      ],
      mainContributions: [
        'Solved the deep network degradation problem via identity shortcuts.',
        'Trained 152-layer deep networks that won all 5 main tracks of ILSVRC & COCO 2015.'
      ]
    },
    architecture: {
      description:
        'The network starts with a 7x7 convolution and max pooling layer, followed by four stages of stacked Residual or Bottleneck blocks. Each residual unit computes F(x) through convolutions, batch normalizations, and ReLU activations, and adds the identity shortcut x before the final ReLU. When feature map spatial dimensions halve, 1x1 stride-2 convolutions match channel dimensions.',
      mermaidCode: `graph TD
  A["Input Image (3 x 224 x 224)"] --> B["Conv1 (7x7, 64 filters, stride 2) + BatchNorm + ReLU"]
  B --> C["Max Pooling (3x3, stride 2)"]
  
  subgraph Stage1 ["Stage 1: Conv2_x (Residual Blocks x3)"]
    C --> D1["Conv 3x3 (64) + BN + ReLU"]
    D1 --> D2["Conv 3x3 (64) + BN"]
    C -. Identity Shortcut .-> D3["Add (+)"]
    D2 --> D3
    D3 --> D4["ReLU Activation"]
  end
  
  subgraph Stage2 ["Stage 2: Conv3_x (Stride 2 Downsampling)"]
    D4 --> E1["Conv 3x3 (128, stride 2) + BN + ReLU"]
    E1 --> E2["Conv 3x3 (128) + BN"]
    D4 -. Projection Shortcut (1x1 Conv) .-> E3["Add (+)"]
    E2 --> E3
    E3 --> E4["ReLU Activation"]
  end
  
  subgraph Stage3And4 ["Stages 3 & 4: Deep Conv4_x & Conv5_x"]
    E4 --> F["Stacked Residual / Bottleneck Units (256 & 512 channels)"]
  end
  
  F --> G["Global Average Pooling (1x1)"]
  G --> H["1000-Way Fully Connected Linear Layer"]
  H --> I["Softmax Classification Probabilities"]`
    },
    futureWork: [
      {
        title: 'Stochastic Residual Depth Pruning for Microcontroller (MCU) Edge Deployment',
        extension:
          'Implement runtime dynamic stochastic layer skipping and INT8 post-training quantization to deploy ResNet-50 onto an ARM Cortex-M micro-controller (TinyML).',
        problemSolved:
          'ResNet-50 requires 25.5 million parameters and ~4 GFLOPs, rendering it impossible to run on batteryless IoT edge sensors.',
        implementationApproach:
          'Train with linear survival probability decay (Stochastic Depth). Export the pruned graph to TensorFlow Lite Micro with integer-only arithmetic, verifying zero float operations.',
        targetMetric: 'Fit within 512KB SRAM with > 88% Top-5 ImageNet accuracy and < 120ms inference time at 3.3V.',
        technologyStack: ['TensorFlow Lite Micro', 'C/C++', 'PyTorch', 'ARM CMSIS-NN', 'PlatformIO'],
        difficulty: 'Advanced',
        portfolioDemonstration:
          'Record a video showing a physical ESP32 / Arduino MCU board classifying real-world objects via camera in real-time with power measurement oscilloscope graphs.'
      },
      {
        title: 'Contrastive Self-Supervised Residual Representation Learning (SimCLR + ResNet)',
        extension:
          'Train a ResNet-18 backbone using self-supervised contrastive InfoNCE loss without human labels on medical histology pathology slides.',
        problemSolved:
          'Medical imaging datasets lack expensive manual pathologist annotations; standard supervised ResNet overfits on small label counts.',
        implementationApproach:
          'Implement data augmentations (color jitter, Gaussian blur, random crop) paired with NT-Xent loss. Fine-tune a linear probe on 1% annotated cancer biopsy patches.',
        targetMetric: 'Match 92% of fully-supervised diagnostic accuracy using only 5% labeled samples.',
        technologyStack: ['PyTorch', 'PyTorch Lightning', 'Albumentations', 'scikit-learn', 'Docker'],
        difficulty: 'Intermediate',
        portfolioDemonstration:
          'Build an interactive Streamlit diagnostic demo showing t-SNE latent feature cluster visualizations separating tumor versus healthy tissue.'
      },
      {
        title: 'Explainable AI: Integrated Grad-CAM & Residual Path Attribution',
        extension:
          'Build a web-based diagnostic tool computing Grad-CAM saliency heatmaps alongside residual shortcut contribution vectors to visualize what deep layers "look at".',
        problemSolved:
          'Residual networks are notoriously hard to audit; stakeholders cannot verify if models are relying on spurious background artifacts.',
        implementationApproach:
          'Compute the gradients of target class scores with respect to feature maps in the final Conv layer; overlay heatmaps onto input images with alpha-blending in Canvas.',
        targetMetric: 'Under 15ms heatmap generation on CPU with pinpoint bounding box localization.',
        technologyStack: ['React', 'TypeScript', 'FastAPI', 'PyTorch', 'OpenCV', 'TailwindCSS'],
        difficulty: 'Beginner',
        portfolioDemonstration:
          'Deploy an interactive web tool allowing interviewers to drag-and-drop their own images and watch Grad-CAM heatmaps update dynamically.'
      }
    ],
    references: [
      {
        title: 'Very Deep Convolutional Networks for Large-Scale Image Recognition (VGG)',
        authors: 'Simonyan & Zisserman',
        year: 2014,
        citation: 'ICLR 2015',
        relevance: 'Standard deep convolutional benchmark prior to ResNet.'
      },
      {
        title: 'Highway Networks',
        authors: 'Srivastava et al.',
        year: 2015,
        citation: 'ICML 2015',
        relevance: 'Gated shortcut predecessor to un-gated identity shortcuts.'
      },
      {
        title: 'Batch Normalization: Accelerating Deep Network Training',
        authors: 'Ioffe & Szegedy',
        year: 2015,
        citation: 'ICML 2015',
        relevance: 'Crucial normalization layer used after each convolution in ResNet.'
      }
    ],
    metadata: {
      generatedAt: '2024-03-01T14:00:00.000Z',
      sourceType: 'sample_paper',
      modelUsed: 'gemini-2.5-flash',
      supplementaryWebResearchUsed: true
    }
  }
];
