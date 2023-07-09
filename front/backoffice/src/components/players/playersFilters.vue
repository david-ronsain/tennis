<script setup lang="ts">
import { PlayerCategoryFilter } from 'core/enums'
import { computed } from 'vue'
import { usePlayersStore } from '../../stores/playersStore'
import { watch } from 'vue'

const categories = [PlayerCategoryFilter.ALL, PlayerCategoryFilter.ATP, PlayerCategoryFilter.WTA]

const category = computed({
    get() {
        return usePlayersStore().getCategory
    },
    set(cat: PlayerCategoryFilter) {
        usePlayersStore().setCategory(cat)
    }
})
const search = computed({
    get() {
        return usePlayersStore().getSearch
    },
    set(s: string) {
        usePlayersStore().setSearch(s)
    }
})

watch(category, () => usePlayersStore().fetchPlayers())
watch(search, () => usePlayersStore().fetchPlayers())
</script>

<template>
    <div id="players-filters" class="d-flex justify-space-between align-center">
        <v-btn-toggle v-model="category" variant="outlined" density="compact" divided>
            <v-btn v-for="cat in categories" :key="cat" :value="cat">
                {{ cat }}
            </v-btn>
        </v-btn-toggle>

        <v-text-field
            class="ml-3"
            placeholder="Search"
            variant="underlined"
            clearable
            density="compact"
            hide-details
            v-model="search"
        />
    </div>
</template>

<style lang="scss">
#players-filters {
    .v-text-field {
        width: 200px;
    }
}
</style>
