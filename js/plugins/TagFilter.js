// 获取所有筛选按钮和博客卡片
const filterButtons = document.querySelectorAll(".filter-button");
const blogCards = document.querySelectorAll(".blog-card");

// 添加事件监听器到每个筛选按钮上
filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        // 获取选中的标签
        const selectedTag = button.getAttribute("data-tag");

        // 切换按钮的选中状态
        filterButtons.forEach(btn => btn.classList.remove("selected"));
        button.classList.add("selected");

        // 过滤博客卡片
        blogCards.forEach(card => {
            const tags = card.getAttribute("data-tags").split(",");

            if (selectedTag === "all" || tags.includes(selectedTag)) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });
    });
});
