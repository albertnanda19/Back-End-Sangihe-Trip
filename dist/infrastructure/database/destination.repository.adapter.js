"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DestinationRepositoryAdapter = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
let DestinationRepositoryAdapter = class DestinationRepositoryAdapter {
    client;
    constructor(client) {
        this.client = client;
    }
    toRow(dest) {
        const { id, name, category, location, distanceKm, price, openHours, description, facilities, tips, images, video, createdAt, } = dest;
        return {
            id,
            name,
            slug: name.toLowerCase().replace(/\s+/g, '-'),
            description,
            address: location.address,
            latitude: location.lat,
            longitude: location.lng,
            opening_hours: openHours,
            entry_fee: price,
            category,
            facilities,
            created_at: createdAt.toISOString(),
        };
    }
    async save(destination) {
        const { error } = await this.client
            .from('destinations')
            .insert(this.toRow(destination)).select('id').single();
        if (error) {
            throw new Error(error.message);
        }
        try {
            if (destination.images.length) {
                const rows = destination.images.map((img) => ({
                    destination_id: destination.id,
                    image_url: img,
                }));
                const { error: imgError } = await this.client
                    .from('destination_images')
                    .insert(rows);
                if (imgError)
                    throw new Error(imgError.message);
            }
        }
        catch (imgErr) {
            await this.client.from('destinations').delete().eq('id', destination.id);
            throw imgErr;
        }
        return destination;
    }
};
exports.DestinationRepositoryAdapter = DestinationRepositoryAdapter;
exports.DestinationRepositoryAdapter = DestinationRepositoryAdapter = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('SUPABASE_CLIENT')),
    __metadata("design:paramtypes", [supabase_js_1.SupabaseClient])
], DestinationRepositoryAdapter);
//# sourceMappingURL=destination.repository.adapter.js.map