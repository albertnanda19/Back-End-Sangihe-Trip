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
exports.LandingPageUseCase = void 0;
const common_1 = require("@nestjs/common");
let LandingPageUseCase = class LandingPageUseCase {
    destinationRepo;
    articleRepo;
    supabase;
    constructor(destinationRepo, articleRepo, supabase) {
        this.destinationRepo = destinationRepo;
        this.articleRepo = articleRepo;
        this.supabase = supabase;
    }
    async execute(category) {
        const hero = {
            title: 'Rencanakan Perjalananmu ke',
            highlight: 'Surga Tropis Sangihe',
            subtitle: 'Temukan destinasi tersembunyi, budaya lokal, dan kuliner khas di kepulauan yang memukau',
            backgroundImage: '/images/pantai-sangihe.jpg',
            ctas: [
                { label: 'Mulai Rencana', type: 'primary', href: '/rencana' },
                { label: 'Lihat Destinasi', type: 'outline', href: '/destinasi' },
            ],
        };
        const filters = ['Semua', 'Pantai', 'Budaya', 'Kuliner', 'Alam'];
        const categoryMap = {
            Pantai: 'beach',
            Budaya: 'cultural',
            Kuliner: 'culinary',
            Alam: 'nature',
        };
        const dbCategory = category && category !== 'Semua' ? categoryMap[category] : undefined;
        const [destRes, artRes] = await Promise.all([
            this.destinationRepo.findAll({
                page: 1,
                pageSize: 6,
                sortBy: 'rating',
                category: dbCategory,
            }),
            this.articleRepo.findAll({ page: 1, perPage: 3, sort: 'latest' }),
        ]);
        const toRupiah = (value) => typeof value === 'number'
            ? `Rp ${value.toLocaleString('id-ID')}`
            : 'Rp -';
        const destinationIds = destRes.data.map((d) => d.id);
        const { data: allImages } = await this.supabase
            .from('destination_images')
            .select('*')
            .in('destination_id', destinationIds)
            .order('sort_order', { ascending: true });
        const imagesByDestination = (allImages || []).reduce((acc, img) => {
            if (!acc[img.destination_id]) {
                acc[img.destination_id] = [];
            }
            acc[img.destination_id].push(img);
            return acc;
        }, {});
        const destinations = destRes.data.map((d) => {
            const images = imagesByDestination[d.id] || [];
            return {
                id: d.id,
                name: d.name,
                location: d.location.address,
                rating: d.rating ?? 0,
                price: toRupiah(d.price),
                images: images.map((img) => ({
                    id: img.id,
                    image_url: img.image_url,
                    alt_text: img.alt_text,
                    sort_order: img.sort_order,
                    is_featured: img.is_featured,
                })),
            };
        });
        const articles = artRes.data.map((a) => ({
            id: a.id,
            slug: a.slug,
            title: a.title,
            excerpt: a.excerpt ?? '',
            date: a.publishDate.toISOString().split('T')[0],
            image: a.featuredImageUrl,
        }));
        return {
            hero,
            filters,
            destinations,
            articles,
        };
    }
};
exports.LandingPageUseCase = LandingPageUseCase;
exports.LandingPageUseCase = LandingPageUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DestinationRepository')),
    __param(1, (0, common_1.Inject)('ArticleRepository')),
    __param(2, (0, common_1.Inject)('SUPABASE_CLIENT')),
    __metadata("design:paramtypes", [Object, Object, Object])
], LandingPageUseCase);
//# sourceMappingURL=landing-page.use-case.js.map