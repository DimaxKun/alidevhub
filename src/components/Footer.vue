<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-inner">
        <span class="footer-brand">
          <i class="bi bi-pen-fill"></i> AliDevHub
        </span>
        <span class="footer-copy">© 2026 Mohammad Ali Dimacaling. All rights reserved.</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: var(--bg-card);
  border-top: 1px solid var(--border);
  padding: 1rem 0;
}

.footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.footer-brand {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--accent);
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.footer-copy {
  font-size: 0.8rem;
  color: var(--text-muted);
}
</style>
