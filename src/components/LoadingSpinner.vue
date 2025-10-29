<template>
  <div class="loading-container">
    <div class="spinner-wrapper">
      <div class="spinner">
        <div class="spinner-leaf"></div>
        <div class="spinner-leaf"></div>
        <div class="spinner-leaf"></div>
        <div class="spinner-leaf"></div>
      </div>
      <p class="loading-text">{{ text }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: 'Carregando dados...'
  }
})
</script>

<style scoped>
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  width: 100%;
}

.spinner-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.spinner {
  position: relative;
  width: 60px;
  height: 60px;
  animation: rotate 2s linear infinite;
}

.spinner-leaf {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.spinner-leaf::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 50%;
  transform: translateX(-50%);
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
}

.spinner-leaf:nth-child(1) {
  transform: rotate(0deg);
  animation: pulse 1.5s ease-in-out infinite;
}

.spinner-leaf:nth-child(2) {
  transform: rotate(90deg);
  animation: pulse 1.5s ease-in-out 0.375s infinite;
}

.spinner-leaf:nth-child(3) {
  transform: rotate(180deg);
  animation: pulse 1.5s ease-in-out 0.75s infinite;
}

.spinner-leaf:nth-child(4) {
  transform: rotate(270deg);
  animation: pulse 1.5s ease-in-out 1.125s infinite;
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.3;
    transform: scale(0.8);
  }
}

.loading-text {
  font-size: 16px;
  font-weight: 500;
  color: #6b7280;
  margin: 0;
  animation: fadeInOut 2s ease-in-out infinite;
}

@keyframes fadeInOut {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Variação com tema escuro (opcional) */
@media (prefers-color-scheme: dark) {
  .spinner-leaf::before {
    background: linear-gradient(135deg, #34d399, #10b981);
  }
  
  .loading-text {
    color: #9ca3af;
  }
}
</style>
