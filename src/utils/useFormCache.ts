/**
 * 表单缓存工具 Composable
 * 用于自动保存和恢复表单数据，提升用户体验
 */

import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { getLocalStorage, setLocalStorage, removeLocalStorage } from './storage';

/**
 * 表单缓存配置
 */
interface FormCacheOptions {
	/**
	 * 缓存键名（必填，用于区分不同表单）
	 */
	key: string;
	/**
	 * 是否在提交成功后清除缓存（默认：true）
	 */
	clearOnSubmit?: boolean;
	/**
	 * 防抖延迟时间（毫秒，默认：500）
	 */
	debounceMs?: number;
	/**
	 * 是否启用缓存（默认：true）
	 */
	enabled?: boolean;
}

/**
 * 使用表单缓存
 * @param formData 表单数据的 ref
 * @param options 缓存配置
 * @returns 清除缓存的函数
 */
export function useFormCache<T extends Record<string, any>>(
	formData: { value: T },
	options: FormCacheOptions
) {
	const {
		key,
		clearOnSubmit = true,
		debounceMs = 500,
		enabled = true,
	} = options;

	const storageKey = `form_cache_${key}`;
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	/**
	 * 保存表单数据到缓存
	 */
	const saveToCache = () => {
		if (!enabled) return;

		try {
			// 只保存非空字段，减少存储空间
			const dataToSave: Partial<T> = {};
			for (const [field, value] of Object.entries(formData.value)) {
				// 保存所有字段，包括空字符串和默认值
				// 这样用户可以恢复所有填写过的内容
				if (value !== null && value !== undefined) {
					dataToSave[field as keyof T] = value;
				}
			}

			// 使用现有的 storage 工具，设置较长的过期时间（7天）
			const sevenDays = 7 * 24 * 60 * 60 * 1000;
			setLocalStorage(storageKey, JSON.stringify(dataToSave), sevenDays);
		} catch (error) {
			console.error('Failed to save form cache:', error);
		}
	};

	/**
	 * 从缓存恢复表单数据
	 */
	const restoreFromCache = () => {
		if (!enabled) return;

		try {
			const cachedData = getLocalStorage(storageKey);
			if (cachedData) {
				const parsed = JSON.parse(cachedData) as Partial<T>;
				// 合并缓存数据到表单，保留默认值
				Object.assign(formData.value, parsed);
			}
		} catch (error) {
			console.error('Failed to restore form cache:', error);
		}
	};

	/**
	 * 防抖保存
	 */
	const debouncedSave = () => {
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}
		debounceTimer = setTimeout(() => {
			saveToCache();
		}, debounceMs);
	};

	/**
	 * 清除缓存
	 */
	const clearCache = () => {
		removeLocalStorage(storageKey);
	};

	// 监听表单数据变化，自动保存
	if (enabled) {
		watch(
			() => formData.value,
			() => {
				debouncedSave();
			},
			{ deep: true }
		);
	}

	// 组件挂载时恢复数据
	onMounted(() => {
		restoreFromCache();
	});

	// 组件卸载前保存数据
	onBeforeUnmount(() => {
		if (debounceTimer) {
			clearTimeout(debounceTimer);
			saveToCache();
		}
	});

	/**
	 * 提交成功后清除缓存（如果配置了）
	 */
	const handleSubmitSuccess = () => {
		if (clearOnSubmit && enabled) {
			clearCache();
		}
	};

	return {
		clearCache,
		handleSubmitSuccess,
		restoreFromCache,
	};
}

