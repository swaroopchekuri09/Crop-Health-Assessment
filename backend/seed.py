import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
from datetime import datetime, timezone
from pymongo import ASCENDING

# Ensure current directory is in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from backend.database.connection import get_db, init_db_indexes
from backend.repositories.crop_repository import CropRepository
from backend.repositories.disease_repository import DiseaseRepository
from backend.repositories.recommendation_repository import RecommendationRepository
from backend.ai.class_mapping import SUPPORTED_CROPS_LIST, MODEL_CLASSES

# Detailed agricultural knowledge database for all 38 classes
KNOWLEDGE_BASE = {
    # 0: Apple Scab
    "Apple___Apple_scab": {
        "symptoms": [
            "Olive-green to velvety dark brown spots on the upper leaf surface.",
            "Deformed, puckered leaves that turn yellow and drop prematurely.",
            "Dark, corky, scabby lesions on young developing fruit."
        ],
        "causes": [
            "Fungal pathogen: Venturia inaequalis.",
            "Favored by prolonged leaf wetness (6+ hours) and cool temperatures (15°C to 24°C).",
            "Overwinters in fallen infected leaves on the orchard floor."
        ],
        "severity": "medium",
        "management": [
            "Prune canopy vigorously during dormancy to maximize sunlight penetration and air circulation.",
            "Shred or rake and compost fallen leaves in autumn to eliminate overwintering fungal ascospores.",
            "Inspect newly emerged spur leaves twice a week during early spring bud break."
        ],
        "prevention": [
            "Plant scab-resistant apple cultivars (e.g., Liberty, Enterprise, Freedom).",
            "Maintain wide tree spacing to accelerate leaf drying after rain events.",
            "Avoid overhead irrigation; use under-canopy micro-sprinklers or drip lines."
        ],
        "precautions": [
            "Never apply sulfur sprays in temperatures exceeding 30°C to prevent severe foliar phytotoxicity.",
            "Wear certified protective equipment (gloves, eye protection, respirator) during foliar applications."
        ],
        "fertilizer_guidance": [
            "Apply 5% urea spray to foliage right before autumn leaf drop to speed microbial leaf decomposition.",
            "Avoid excessive spring nitrogen fertilization, which creates tender succulent foliage prone to infection."
        ],
        "pesticide_guidance": [
            "Preventive: Apply copper-based protectant sprays or Mancozeb at green-tip to tight-cluster stage.",
            "Curative: Apply systemic fungicides like Difenoconazole or Myclobutanil within 48–72 hours of an infection period.",
            "Always follow label-specified pre-harvest intervals (PHI) and rotate chemical groups to avoid resistance."
        ]
    },

    # 1: Apple Black Rot
    "Apple___Black_rot": {
        "symptoms": [
            "Frog-eye leaf spots with brown centers and distinct purple margins.",
            "Firm brown rotted fruit lesions that form concentric rings and dry into black mummies.",
            "Sunken reddish-brown bark cankers on limbs."
        ],
        "causes": [
            "Fungal pathogen: Botryosphaeria obtusa.",
            "Enters through mechanical wounds, hail damage, or pruning stubs.",
            "Favored by warm humid weather (20°C to 27°C)."
        ],
        "severity": "high",
        "management": [
            "Prune out all dead branches, cankers, and fire-blight strikes at least 15 cm below infected margins.",
            "Remove and incinerate all mummified fruit hanging on branches or lying on the ground.",
            "Disinfect pruning shears with 70% isopropyl alcohol between consecutive cuts."
        ],
        "prevention": [
            "Maintain orchard vigor through balanced soil management and mulching.",
            "Prevent insect punctures and mechanical machinery damage to bark and fruit.",
            "Select resistant cultivars suited to humid temperate zones."
        ],
        "precautions": [
            "Do not leave pruned cankerous wood in piles near the orchard, as spores remain active for months."
        ],
        "fertilizer_guidance": [
            "Ensure adequate potassium and calcium levels to reinforce cellular wall strength in fruit tissues.",
            "Balance soil pH to 6.2–6.8 to support healthy root uptake."
        ],
        "pesticide_guidance": [
            "Apply protective fungicides containing Captan or Thiophanate-methyl from pink bud stage through petal fall.",
            "Ensure full coverage spray including the inner canopy and bark framework."
        ]
    },

    # 2: Cedar Apple Rust
    "Apple___Cedar_apple_rust": {
        "symptoms": [
            "Bright orange-yellow circular spots on upper leaf surfaces.",
            "Small raised fruiting bodies (aecia) producing tube-like projections on the leaf underside.",
            "Severe infections cause early summer defoliation and undersized fruit."
        ],
        "causes": [
            "Fungal pathogen: Gymnosporangium juniperi-virginianae.",
            "Requires two alternating hosts: Apple (Malus) and Eastern Red Cedar/Juniper (Juniperus).",
            "Galls on junipers release infectious teliospores during moist spring rains."
        ],
        "severity": "medium",
        "management": [
            "Remove wild red cedar and juniper shrubs within a 1–2 km radius around commercial orchards.",
            "Rake and remove infected apple leaves in late summer.",
            "Scout nearby ornamental junipers and prune off brown galled swellings before spring rains."
        ],
        "prevention": [
            "Plant resistant apple varieties (e.g., Redfree, Prima, Pristine).",
            "Establish a non-host windbreak buffer around the perimeter."
        ],
        "precautions": [
            "Chemical treatments are only effective during early spring spore release; summer sprays yield no benefit."
        ],
        "fertilizer_guidance": [
            "Maintain optimal trace minerals (Zinc, Boron) to alleviate metabolic stress caused by foliar lesions."
        ],
        "pesticide_guidance": [
            "Apply Myclobutanil, Propiconazole, or Mancozeb beginning at pink bud stage until 2–3 weeks after petal fall."
        ]
    },

    # 3: Healthy Apple
    "Apple___healthy": {
        "symptoms": [
            "Leaves exhibit uniform deep green coloration with serrated, clean margins.",
            "No visible chlorosis, necrosis, leaf curling, or scabby lesions."
        ],
        "causes": ["Optimal orchard health, balanced nutrition, and sound pest management."],
        "severity": "none",
        "management": [
            "Maintain regular weekly scouting schedules across tree quadrants.",
            "Continue standard summer pruning for canopy ventilation."
        ],
        "prevention": [
            "Apply dormant copper or horticultural mineral oil sprays before bud swell to control overwintering pests.",
            "Maintain weed-free tree strips under canopies."
        ],
        "precautions": ["Avoid unneeded prophylactic pesticide treatments to conserve predatory phytoseiid mites."],
        "fertilizer_guidance": [
            "Fertilize in early spring based on annual leaf-tissue analysis. Aim for balanced N-P-K (10-10-10 or 12-12-17)."
        ],
        "pesticide_guidance": [
            "No chemical fungicides or insecticides required. Protect natural parasitoids and pollinator populations."
        ]
    },

    # 4: Healthy Blueberry
    "Blueberry___healthy": {
        "symptoms": [
            "Lush, glossy green foliage with robust cane elongation and healthy white flower clusters."
        ],
        "causes": ["Acidic soil conditions (pH 4.5–5.2), steady moisture, and good drainage."],
        "severity": "none",
        "management": ["Maintain 8–10 cm pine needle or sawdust mulch around bushes to regulate soil temperature."],
        "prevention": ["Prune out canes older than 6 years during winter dormancy to stimulate young renewal shoots."],
        "precautions": ["Never use nitrate fertilizers on blueberries; they require ammonium-based nitrogen."],
        "fertilizer_guidance": [
            "Apply ammonium sulfate in 3 split applications (bud break, 6 weeks later, and post-harvest)."
        ],
        "pesticide_guidance": ["No chemical treatments needed. Maintain clean drip lines."]
    },

    # 5: Cherry Powdery Mildew
    "Cherry_(including_sour)___Powdery_mildew": {
        "symptoms": [
            "White powdery patches of fungal mycelium and conidia on leaves and terminal shoots.",
            "Distorted, upward-curling leaf margins on young expanding leaves.",
            "Stunted terminal twig growth."
        ],
        "causes": [
            "Fungal pathogen: Podosphaera clandestina.",
            "Favored by warm days, cool humid nights, and dense shaded tree canopies."
        ],
        "severity": "medium",
        "management": [
            "Prune infected terminal shoot tips showing dense white mold.",
            "Thin inner branches to allow direct sunlight penetration throughout the canopy."
        ],
        "prevention": [
            "Avoid overhead irrigation which promotes humidity spikes within the lower canopy.",
            "Monitor water sprout foliage where disease typically initiates."
        ],
        "precautions": ["Do not apply sulfur when temperatures are forecasted above 32°C."],
        "fertilizer_guidance": [
            "Avoid high late-season nitrogen which encourages flush growth vulnerable to autumn mildew."
        ],
        "pesticide_guidance": [
            "Apply wettable sulfur, Potassium bicarbonate, or Quinoxyfen starting at petal fall."
        ]
    },

    # 6: Healthy Cherry
    "Cherry_(including_sour)___healthy": {
        "symptoms": ["Smooth, intact dark green leaves with uniform venation and healthy spurs."],
        "causes": ["Good orchard sanitation, balanced irrigation, and dormant pest control."],
        "severity": "none",
        "management": ["Scout weekly during fruit enlargement for brown rot or cherry fruit fly."],
        "prevention": ["Paint trunks with white diluted latex paint in autumn to prevent winter sunscald."],
        "precautions": ["Minimize sprinkler splashing against tree trunks."],
        "fertilizer_guidance": ["Provide balanced micronutrients (calcium and boron) for fruit firmness."],
        "pesticide_guidance": ["No chemical pesticides needed."]
    },

    # 7: Corn Cercospora Gray Leaf Spot
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": {
        "symptoms": [
            "Small rectangular necrotic spots bounded by leaf veins.",
            "Lesions expand into tan or gray rectangular streaks (2–5 cm long).",
            "Severe blight causes extensive foliar death and stalk lodging."
        ],
        "causes": [
            "Fungal pathogen: Cercospora zeae-maydis.",
            "Overwinters in minimum-till or continuous corn residue.",
            "Favored by prolonged dew periods and relative humidity above 90%."
        ],
        "severity": "high",
        "management": [
            "Till under surface crop residues after harvest to accelerate decomposition.",
            "Harvest heavily infected fields early to avoid catastrophic stalk breakage and lodging losses."
        ],
        "prevention": [
            "Plant corn hybrids with high GLS resistance scores.",
            "Implement a minimum 2-year crop rotation with non-host crops like soybean or wheat."
        ],
        "precautions": ["Scout leaf layers below the primary ear leaf before tassel (VT) emergence."],
        "fertilizer_guidance": [
            "Ensure balanced potassium nutrition; potassium deficiency elevates stalk lodging susceptibility."
        ],
        "pesticide_guidance": [
            "Apply strobilurin or triazole fungicides (e.g., Pyraclostrobin, Azoxystrobin + Propiconazole) at VT to R1 stage."
        ]
    },

    # 8: Corn Common Rust
    "Corn_(maize)___Common_rust_": {
        "symptoms": [
            "Small, oval to elongate cinnamon-brown pustules scattered across both leaf surfaces.",
            "Pustules rupture the epidermis and release reddish-brown powdery urediniospores."
        ],
        "causes": [
            "Fungal pathogen: Puccinia sorghi.",
            "Windblown spores transported from southern tropical zones.",
            "Favored by cool to moderate temperatures (16°C–25°C) and high humidity."
        ],
        "severity": "medium",
        "management": [
            "Assess threshold: If pustules cover >10% of leaf area above the ear leaf before blister stage, intervene."
        ],
        "prevention": [
            "Choose hybrids with specific resistance genes (Rp genes) or general field tolerance."
        ],
        "precautions": ["Fungicide sprays after dent stage (R5) rarely provide positive economic returns."],
        "fertilizer_guidance": ["Maintain steady nitrogen supply according to yield goal calculations."],
        "pesticide_guidance": [
            "Fungicides containing Azoxystrobin, Pyraclostrobin, or Tebuconazole provide good control if applied early."
        ]
    },

    # 9: Corn Northern Leaf Blight
    "Corn_(maize)___Northern_Leaf_Blight": {
        "symptoms": [
            "Large, long elliptical cigar-shaped grayish-green to tan lesions (3–15 cm long).",
            "Dark concentric zones of fungal sporulation during damp mornings.",
            "Whole leaves turn prematurely grayish brown and crisp."
        ],
        "causes": [
            "Fungal pathogen: Exserohilum turcicum.",
            "Overwinters in corn debris.",
            "Favored by moderate temperatures (18°C–27°C) and heavy morning fogs."
        ],
        "severity": "high",
        "management": [
            "Perform deep tillage where erosion guidelines permit to bury infected residue.",
            "Monitor susceptible sweet corn and field corn hybrid lines closely."
        ],
        "prevention": [
            "Select hybrids possessing Ht-resistance genes (Ht1, Ht2, Ht3, HtN).",
            "Rotate fields with legume crops for at least one full growing cycle."
        ],
        "precautions": ["Avoid late planting dates that expose young canopy to peak mid-summer spore loads."],
        "fertilizer_guidance": [
            "Maintain soil fertility; avoid nitrogen starvation which reduces plant defensive secondary metabolites."
        ],
        "pesticide_guidance": [
            "Apply registered fungicides (e.g., Pyraclostrobin, Fluxapyroxad, or Tebuconazole) if lesions appear before silking."
        ]
    },

    # 10: Healthy Corn
    "Corn_(maize)___healthy": {
        "symptoms": ["Vigorous, dark green upright leaves with clean venation and stout stalk development."],
        "causes": ["Adequate soil moisture, timely planting, and effective weed management."],
        "severity": "none",
        "management": ["Monitor stand density and scout weekly for cutworms and armyworms during early vegetative stages."],
        "prevention": ["Employ pre-emergent residual herbicides to eliminate early vegetative weed competition."],
        "precautions": ["Calibrate planter depth to 4–5 cm to guarantee uniform emergence."],
        "fertilizer_guidance": [
            "Side-dress nitrogen at V4–V6 stage when corn enters rapid vegetative uptake."
        ],
        "pesticide_guidance": ["No fungicide needed. Preserve beneficial carabid ground beetles."]
    },

    # 11: Grape Black Rot
    "Grape___Black_rot": {
        "symptoms": [
            "Small, circular reddish-brown leaf spots with dark margins and tiny black dots (pycnidia).",
            "Berries develop light brown spots that rapidly envelop the entire grape, shriveling into hard, wrinkled black mummies."
        ],
        "causes": [
            "Fungal pathogen: Guignardia bidwellii.",
            "Overwinters in mummified berries on vines or soil.",
            "Requires moisture and temperatures between 21°C and 32°C."
        ],
        "severity": "high",
        "management": [
            "Prune out and destroy all mummified fruit clusters during dormant vineyard maintenance.",
            "Keep grass and weeds mowed short directly underneath the trellis to promote air flow."
        ],
        "prevention": [
            "Implement shoot positioning and canopy leaf removal around fruit zones after bloom.",
            "Plant less susceptible grape cultivars where black rot pressure is endemic."
        ],
        "precautions": ["Spraying after berries turn purple (veraison) is ineffective because mature berries develop ontogenic resistance."],
        "fertilizer_guidance": ["Avoid excessive spring nitrogen to prevent overly thick vine canopies."],
        "pesticide_guidance": [
            "Apply Mancozeb, Captan, or Myclobutanil beginning at 2–3 inch shoot growth through 4–5 weeks post-bloom."
        ]
    },

    # 12: Grape Esca (Black Measles)
    "Grape___Esca_(Black_Measles)": {
        "symptoms": [
            "'Tiger-stripe' leaf patterns: interveinal yellow or red chlorosis followed by necrotic drying.",
            "Berries display dark purple, sunken spots ('measles') and cracked skin.",
            "Internal cross-sections of woody trunk show soft, spongy, yellowish-white decay."
        ],
        "causes": [
            "Complex of wood-colonizing fungi: Phaeomoniella chlamydospora, Phaeoacremonium aleophilum, and Fomitiporia mediterranea.",
            "Infection occurs primarily through pruning wounds during wet winter periods."
        ],
        "severity": "high",
        "management": [
            "Delay pruning until late winter (dormancy end) when healing of pruning wounds is faster.",
            "Paint all large pruning cuts (>2 cm diameter) with wound protectant sealants or biocontrol paste (Trichoderma).",
            "Uproot and burn vines that display complete apoplectic collapse."
        ],
        "prevention": [
            "Purchase certified disease-free nursery rootstock and grafted vines.",
            "Avoid double-pruning during rainy or foggy winter weeks."
        ],
        "precautions": ["There are no curative foliar fungicide treatments once the trunk vascular tissue is colonized."],
        "fertilizer_guidance": ["Reduce vine water and nutrient stress; optimize drip irrigation scheduling during hot spells."],
        "pesticide_guidance": ["Treat pruning wounds directly with wound sealant containing Pyraclostrobin or Boron paste."]
    },

    # 13: Grape Isariopsis Leaf Spot
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": {
        "symptoms": [
            "Irregular brown to reddish necrotic leaf spots, often surrounded by yellow halos.",
            "Dark olivaceous velvety mold visible on lower lesion surfaces during humid mornings.",
            "Early defoliation of lower vine foliage leading to poor grape ripening."
        ],
        "causes": [
            "Fungal pathogen: Pseudocercospora vitis (syn. Isariopsis clavispora).",
            "Prolonged leaf wetness and warm subtropical climates."
        ],
        "severity": "medium",
        "management": [
            "Tuck shoots into catch wires and perform leaf pulling in the fruiting zone to facilitate drying.",
            "Collect and destroy fallen leaf debris at post-harvest."
        ],
        "prevention": ["Maintain proper vine spacing and orient vine rows parallel to prevailing winds."],
        "precautions": ["Check vine canopies following heavy summer monsoons or overhead frost protection runs."],
        "fertilizer_guidance": ["Maintain potassium balance to prevent premature foliar senescence."],
        "pesticide_guidance": ["Apply copper oxychloride, Mancozeb, or Carbendazim when initial spots appear on lower leaves."]
    },

    # 14: Healthy Grape
    "Grape___healthy": {
        "symptoms": ["Lush palmate leaves, vigorous shoot tips with functional tendrils, clean berries."],
        "causes": ["Good vineyard microclimate, precise canopy training, and balanced soil moisture."],
        "severity": "none",
        "management": ["Perform shoot thinning and leaf pulling around fruit clusters for sunlight exposure."],
        "prevention": ["Maintain cover crops in row alleys to suppress weeds and build beneficial insect habitat."],
        "precautions": ["Avoid soil compaction from heavy tractor passes during wet conditions."],
        "fertilizer_guidance": ["Apply petiole-based micronutrients (Zinc, Magnesium, Boron) at bloom."],
        "pesticide_guidance": ["No chemical fungicides needed. Maintain clean organic canopy management."]
    },

    # 15: Orange Citrus Greening (Huanglongbing)
    "Orange___Haunglongbing_(Citrus_greening)": {
        "symptoms": [
            "Blotchy, asymmetric foliar mottling (one side of leaf blade differs from the other).",
            "Yellow veins resembling zinc or iron nutritional deficiency.",
            "Stunted, bitter, lopsided fruit that fails to color properly (retains green lower rind).",
            "Twig dieback and overall tree decline."
        ],
        "causes": [
            "Bacterial pathogen: Candidatus Liberibacter asiaticus.",
            "Vectored by the Asian Citrus Psyllid (Diaphorina citri).",
            "Systemic phloem-clogging infection."
        ],
        "severity": "critical",
        "management": [
            "Uproot and destroy infected trees immediately to reduce bacterial reservoirs.",
            "Control psyllid vectors aggressively using coordinated area-wide pesticide programs.",
            "Inspect flush foliage weekly for psyllid nymphs (white waxy secretions)."
        ],
        "prevention": [
            "Propagate only clean certified pathogen-free citrus nursery budwood under certified screenhouses.",
            "Establish perimeter windbreaks to discourage psyllid immigration."
        ],
        "precautions": [
            "There is no cure once a citrus tree is infected. Nutritional sprays only mask symptoms temporarily."
        ],
        "fertilizer_guidance": [
            "Enhanced foliar nutrition packages (Zinc, Manganese, Iron, Phosphites) help prolong productivity of lightly affected groves."
        ],
        "pesticide_guidance": [
            "Target vector: Systemic neonicotinoids (Imidacloprid) on young trees; rotate with pyrethroids and horticultural oils for adults."
        ]
    },

    # 16: Peach Bacterial Spot
    "Peach___Bacterial_spot": {
        "symptoms": [
            "Small, angular, water-soaked purple-black spots on leaves.",
            "Centers of leaf spots drop out, producing a 'shot-hole' appearance.",
            "Pitted, cracked, gum-exuding lesions on peach fruit."
        ],
        "causes": [
            "Bacterial pathogen: Xanthomonas arboricola pv. pruni.",
            "Splashed by wind-driven rains; thrives in warm humid climates.",
            "Overwinters in twig cankers and dormant buds."
        ],
        "severity": "medium",
        "management": [
            "Prune out dead shoots and cankered twigs during winter dormancy.",
            "Avoid planting highly susceptible peach cultivars on sandy, exposed sites."
        ],
        "prevention": [
            "Establish windbreak rows to shield orchard blocks from abrasion by wind-blown sand particles.",
            "Avoid overhead irrigation entirely."
        ],
        "precautions": ["Do not apply excessive copper after petal fall as peach foliage is exceptionally copper-sensitive."],
        "fertilizer_guidance": [
            "Avoid excess nitrogen in late spring; nitrogen flushes create succulent tissues prone to bacterial entry."
        ],
        "pesticide_guidance": [
            "Dormant stage: Apply copper hydroxide sprays.",
            "Growing season: Apply low-rate copper formulations combined with Oxytetracycline (Mycoshield) where permitted."
        ]
    },

    # 17: Healthy Peach
    "Healthy Peach Plant": {
        "symptoms": ["Smooth, lanceolate deep green leaves with clean red-tinted petioles and unblemished fruit."],
        "causes": ["Effective winter dormant sanitation, balanced pruning, and adequate chilling hours."],
        "severity": "none",
        "management": ["Thin young fruitlets to 15–20 cm spacing to encourage large, high-brix peaches."],
        "prevention": ["Apply winter dormant copper/oil spray to prevent peach leaf curl (Taphrina deformans)."],
        "precautions": ["Avoid pruning during wet periods to avert bacterial canker infection."],
        "fertilizer_guidance": ["Provide balanced 10-10-10 fertilizer in split applications around the drip line."],
        "pesticide_guidance": ["No active chemical fungicides needed."]
    },

    # 18: Bell Pepper Bacterial Spot
    "Pepper,_bell___Bacterial_spot": {
        "symptoms": [
            "Small, circular or irregular water-soaked spots on leaves that turn brown with dark borders.",
            "Extensive leaf yellowing and severe defoliation, exposing fruit to sunscald.",
            "Raised, blister-like or scabby warts on the fruit surface."
        ],
        "causes": [
            "Bacterial pathogen: Xanthomonas euvesicatoria.",
            "Seed-borne or survives in infested crop debris.",
            "Splashed by rain and overhead sprinkler irrigation."
        ],
        "severity": "high",
        "management": [
            "Rogue out and destroy infected transplants immediately upon discovery in the nursery.",
            "Sanitize greenhouse benches and trays with 10% bleach solution between crop cycles.",
            "Avoid working in pepper fields when foliage is wet from rain or morning dew."
        ],
        "prevention": [
            "Plant certified pathogen-free, hot-water-treated seed or resistant hybrid varieties (X10R resistance).",
            "Practice minimum 2-year crop rotation out of solanaceous crops (tomato, potato, eggplant)."
        ],
        "precautions": ["Bacterial resistance to fixed copper bactericides is widespread; always combine copper with Mancozeb."],
        "fertilizer_guidance": [
            "Provide balanced calcium and magnesium to boost cell wall structural resilience against bacterial pectolytic enzymes."
        ],
        "pesticide_guidance": [
            "Apply copper hydroxide + Mancozeb tank mixes every 7–10 days during warm wet weather.",
            "Consider plant defense activator Acibenzolar-S-methyl (Actigard) before disease onset."
        ]
    },

    # 19: Healthy Bell Pepper
    "Pepper,_bell___healthy": {
        "symptoms": ["Lush, dark green ovate leaves, strong upright stems, firm glossy bell peppers."],
        "causes": ["Warm sunny conditions (21°C–29°C), drip irrigation, and balanced nutrient fertigation."],
        "severity": "none",
        "management": ["Support plants with stakes or netting to prevent fruit-laden branches from lodging."],
        "prevention": ["Use silver reflective mulch to disorient aphids and thrips vectors of viral diseases."],
        "precautions": ["Avoid abrupt moisture fluctuations to eliminate blossom end rot."],
        "fertilizer_guidance": ["Maintain steady calcium and potassium fertigation throughout the fruit-filling phase."],
        "pesticide_guidance": ["No chemical treatments needed."]
    },

    # 20: Potato Early Blight
    "Potato___Early_blight": {
        "symptoms": [
            "Circular to angular brown spots on older lower leaves, characterized by concentric rings ('target board' pattern).",
            "Spots surrounded by chlorotic yellow halos, causing lower leaves to wither and drop.",
            "Dark, sunken, leathery lesions on potato tubers."
        ],
        "causes": [
            "Fungal pathogen: Alternaria solani.",
            "Thrives under alternating dry and wet periods with temperatures around 24°C–29°C.",
            "Overwinters in solanaceous plant residues and volunteer potatoes."
        ],
        "severity": "medium",
        "management": [
            "Destroy volunteer potato plants and nightshade weeds near fields.",
            "Kill potato vines (haulm destruction) 2–3 weeks before harvest to thicken tuber skins and avoid harvest inoculation.",
            "Harvest only during dry soil conditions."
        ],
        "prevention": [
            "Use certified disease-free seed tubers.",
            "Maintain wide plant spacing and drip irrigation to minimize foliar wetness periods.",
            "Implement a 3-year crop rotation with non-host crops (cereals, legumes, corn)."
        ],
        "precautions": ["Do not harvest immature tubers with scuffing skins; wounds facilitate storage rot."],
        "fertilizer_guidance": [
            "Maintain optimal nitrogen and phosphorus levels; plants suffering nutrient stress or senescence are far more vulnerable."
        ],
        "pesticide_guidance": [
            "Apply protectant fungicides like Chlorothalonil or Mancozeb starting when plants reach 30 cm height.",
            "Rotate with QoI/SDHI group fungicides (e.g., Boscalid, Azoxystrobin) under high disease pressure."
        ]
    },

    # 21: Potato Late Blight
    "Potato___Late_blight": {
        "symptoms": [
            "Water-soaked, pale-to-dark green irregular lesions that expand rapidly into large brown-black blights.",
            "Delicate white fuzzy fungal sporulation on the underside of leaves during damp mornings.",
            "Foul decaying odor in severely blighted fields; total canopy collapse within days.",
            "Tubers develop a granular reddish-brown dry rot that turns into foul bacterial soft rot."
        ],
        "causes": [
            "Oomycete pathogen: Phytophthora infestans (the historical agent of the Irish Potato Famine).",
            "Extremely destructive; spores travel miles on cool, humid winds (15°C–20°C, RH > 90%)."
        ],
        "severity": "critical",
        "management": [
            "Scout fields continuously during cool rainy spells; inspect low spots and field edges.",
            "Destroy cull piles immediately: bury deeply under 60 cm soil, freeze, or treat with salt.",
            "If late blight is confirmed in a field, destroy the infected hot spot immediately (mow or burn) to save adjacent acres."
        ],
        "prevention": [
            "Plant only certified disease-free seed potatoes with zero late blight tolerance.",
            "Ensure high hilling (at least 10–12 cm soil over tubers) to prevent motile zoospores from washing down to tubers.",
            "Avoid overhead irrigation in the late afternoon."
        ],
        "precautions": [
            "Never store tubers harvested from fields with active late blight; they will rot and destroy the entire bin."
        ],
        "fertilizer_guidance": [
            "Avoid excessive nitrogen that creates thick, slow-drying foliar canopies.",
            "Ensure adequate potash to maintain tuber cellular resilience."
        ],
        "pesticide_guidance": [
            "Preventive: Apply Chlorothalonil, Mancozeb, or Fluazinam prior to infection events.",
            "Curative/Translaminar: Apply Cymoxanil, Propamocarb, Dimethomorph, or Mandipropamid as soon as weather risk alerts trigger.",
            "Strictly rotate chemical modes of action (FRAC codes) to inhibit resistance development."
        ]
    },

    # 22: Healthy Potato
    "Potato___healthy": {
        "symptoms": ["Dense, dark green upright canopy, clean leaves, vigorous stolon and tuber set."],
        "causes": ["Certified clean seed, balanced nutrient management, and proper hill mounding."],
        "severity": "none",
        "management": ["Hill potatoes twice during early vegetative growth to prevent tuber greening."],
        "prevention": ["Scout weekly for Colorado potato beetle and potato leafhoppers."],
        "precautions": ["Avoid over-irrigation during early tuber initiation to prevent powdery scab."],
        "fertilizer_guidance": ["Apply balanced N-P-K (1:2:2 ratio) at planting followed by nitrogen side-dressing."],
        "pesticide_guidance": ["No active chemical fungicides required."]
    },

    # 23: Healthy Raspberry
    "Raspberry___healthy": {
        "symptoms": ["Vibrant green compound leaves, healthy floricanes and primocanes, clean berry drupelets."],
        "causes": ["Well-drained soil with high organic matter, trellis support, and drip irrigation."],
        "severity": "none",
        "management": ["Prune out spent floricanes immediately after summer harvest to provide airflow for new canes."],
        "prevention": ["Keep planting beds mulched and install trellis wires to keep foliage elevated off soil."],
        "precautions": ["Raspberries are very sensitive to wet feet; avoid heavy clay poorly-drained soil."],
        "fertilizer_guidance": ["Apply well-rotted manure or 10-10-10 fertilizer in early spring."],
        "pesticide_guidance": ["No chemical treatments needed."]
    },

    # 24: Healthy Soybean
    "Soybean___healthy": {
        "symptoms": ["Uniform trifoliate green leaves, sturdy stems with abundant nodulation, clean pod set."],
        "causes": ["Effective Bradyrhizobium inoculation, weed-free canopy, and balanced soil pH (6.0–6.8)."],
        "severity": "none",
        "management": ["Monitor fields between R1 (beginning bloom) and R4 (full pod) stages for foliar pests."],
        "prevention": ["Utilize no-till or reduced-till practices to conserve soil moisture and prevent crusting."],
        "precautions": ["Check roots periodically to verify healthy pink Bradyrhizobium nitrogen-fixing nodules."],
        "fertilizer_guidance": [
            "Ensure adequate soil Phosphorus and Potassium; soybeans fix their own nitrogen when well inoculated."
        ],
        "pesticide_guidance": ["No fungicide application needed."]
    },

    # 25: Squash Powdery Mildew
    "Squash___Powdery_mildew": {
        "symptoms": [
            "White, talcum-powder-like fungal patches on upper and lower surfaces of broad leaves and petioles.",
            "Infected leaves turn yellow, brown, and become brittle, exposing developing squash to sunscald.",
            "Premature vine decline and reduced fruit sugar content."
        ],
        "causes": [
            "Fungal pathogen: Podosphaera xanthii (syn. Sphaerotheca fuliginea).",
            "Does not require liquid water to germinate; thrives in dense shaded canopies with high humidity (50%–90%) and warm temperatures (20°C–28°C)."
        ],
        "severity": "medium",
        "management": [
            "Prune or remove severely infected older base leaves to promote air movement.",
            "Position vine runners to avoid dense overcrowding.",
            "Destroy crop residues promptly after final fruit harvest."
        ],
        "prevention": [
            "Plant resistant cucurbit varieties and hybrids (look for 'PM' resistance designations).",
            "Maintain wide in-row and between-row spacing for maximum sunlight penetration.",
            "Use drip irrigation under black plastic mulch."
        ],
        "precautions": ["Check the underside of crown leaves where powdery mildew colonies first establish."],
        "fertilizer_guidance": ["Avoid excessive nitrogen fertilizers that stimulate rapid dense foliar growth."],
        "pesticide_guidance": [
            "Organic: Apply Potassium bicarbonate, neem oil, or horticultural oils at 7-day intervals upon first sighting.",
            "Conventional: Apply Difenoconazole, Cyflufenamid, or Triflumizole alternating across FRAC groups."
        ]
    },

    # 26: Strawberry Leaf Scorch
    "Strawberry___Leaf_scorch": {
        "symptoms": [
            "Numerous irregular dark purple or brown blotches on upper leaf surfaces (1–5 mm diameter).",
            "Blotches coalesce, causing the leaf margins to curl upward and look burned or scorched.",
            "Lesions develop on calyx, flower stems, and stolons, leading to shriveled fruit."
        ],
        "causes": [
            "Fungal pathogen: Diplocarpon earlianum.",
            "Overwinters on infected living green strawberry leaves and old foliage.",
            "Spreads via splashing rain and overhead sprinkler irrigation."
        ],
        "severity": "medium",
        "management": [
            "Mow, renovate, and remove old foliage immediately after harvest in perennial beds.",
            "Thin runner plants to maintain narrow, well-aerated rows (30–45 cm wide).",
            "Collect and burn severely blighted leaves."
        ],
        "prevention": [
            "Select resistant or tolerant strawberry cultivars.",
            "Use drip irrigation or drip tape under straw or plastic mulch rather than overhead guns.",
            "Establish new plantings only with clean certified dormant bare-root or plug plants."
        ],
        "precautions": ["Avoid applying high nitrogen in mid-summer which fuels excessive leaf proliferation."],
        "fertilizer_guidance": [
            "Fertilize primarily during post-harvest renovation and late summer bud formation."
        ],
        "pesticide_guidance": [
            "Apply protective fungicides like Captan, Thiophanate-methyl, or copper sprays before bloom if leaf scorch was prevalent the prior season."
        ]
    },

    # 27: Healthy Strawberry
    "Strawberry___healthy": {
        "symptoms": ["Lush trifoliate green leaves, bright white petals with yellow centers, plump red berries."],
        "causes": ["Good strawberry bed drainage, straw or plastic mulch, and regular drip irrigation."],
        "severity": "none",
        "management": ["Renovate beds annually after harvest and maintain clean straw mulch around berries."],
        "prevention": ["Scout weekly for two-spotted spider mites and tarnished plant bugs."],
        "precautions": ["Keep berries elevated off direct wet soil to avoid Botrytis gray mold."],
        "fertilizer_guidance": ["Apply balanced slow-release fertilizer during post-harvest renovation."],
        "pesticide_guidance": ["No chemical fungicides needed."]
    },

    # 28: Tomato Bacterial Spot
    "Tomato___Bacterial_spot": {
        "symptoms": [
            "Small, dark brown, circular to angular water-soaked spots on leaves (less than 3 mm).",
            "Spots become sunken with greasy centers; leaves turn yellow and drop prematurely.",
            "Small, raised, scab-like blister spots on green fruit that turn dark brown with rough borders."
        ],
        "causes": [
            "Bacterial pathogen: Xanthomonas perforans / Xanthomonas vesicatoria.",
            "Seed-borne and debris-borne.",
            "Favored by warm temperatures (24°C–30°C) and driving rain or overhead sprinkler irrigation."
        ],
        "severity": "high",
        "management": [
            "Rogue out infected seedlings in nurseries immediately.",
            "Never work or prune in tomato fields while leaves are wet.",
            "Disinfect stakes, trellis wires, and pruning shears between rows."
        ],
        "prevention": [
            "Use certified pathogen-tested seed or hot-water-treated seed (50°C for 25 minutes).",
            "Rotate crops out of solanaceous species for at least 2–3 seasons.",
            "Use drip irrigation and plastic mulch to eliminate soil-to-leaf splashing."
        ],
        "precautions": [
            "Bacterial spot strains often exhibit resistance to copper; standalone copper applications often fail."
        ],
        "fertilizer_guidance": [
            "Maintain balanced calcium and potassium nutrition to enhance structural wall defenses against bacterial invasion."
        ],
        "pesticide_guidance": [
            "Apply copper hydroxide tank-mixed with Mancozeb to overcome bacterial copper resistance.",
            "Utilize bacteriophage bio-pesticides or plant defense inducers (Actigard) preventively."
        ]
    },

    # 29: Tomato Early Blight
    "Tomato___Early_blight": {
        "symptoms": [
            "Dark brown to black necrotic spots with concentric ring pattern ('target board') on older lower leaves.",
            "Extensive chlorosis surrounding lesions, causing lower canopy defoliation progressing upward.",
            "Dark, sunken, leathery cankers at the stem base and fruit stem-end."
        ],
        "causes": [
            "Fungal pathogen: Alternaria linariae (formerly Alternaria solani).",
            "Overwinters in plant debris and solanaceous weeds.",
            "Favored by heavy dews, frequent rain, and temperatures between 24°C and 29°C."
        ],
        "severity": "medium",
        "management": [
            "Prune off the bottom 30 cm of leaves once plants are established to eliminate contact with soil splash.",
            "Stake, cage, and trellis tomatoes to maintain upright airflow.",
            "Remove and destroy infected lower foliage as soon as concentric spots appear."
        ],
        "prevention": [
            "Plant resistant tomato cultivars (look for 'EB' resistance such as Mountain Supreme, Defiant).",
            "Apply thick organic or plastic mulch around the base of every plant.",
            "Maintain a 3-year crop rotation."
        ],
        "precautions": ["Avoid overhead irrigation; water strictly at ground level using drip tape."],
        "fertilizer_guidance": [
            "Do not allow plants to become nitrogen deficient; nitrogen-starved tomatoes succumb rapidly to Alternaria."
        ],
        "pesticide_guidance": [
            "Preventive: Apply Chlorothalonil, Mancozeb, or copper sprays every 7–10 days.",
            "Systemic: Azoxystrobin, Difenoconazole, or Boscalid when disease first threatens."
        ]
    },

    # 30: Tomato Late Blight
    "Tomato___Late_blight": {
        "symptoms": [
            "Large, irregular water-soaked pale-green to dark-brown lesions that enlarge rapidly.",
            "White velvety fungal growth (sporangia) on leaf undersides in humid conditions.",
            "Stems develop greasy, dark brown cankers.",
            "Green and ripe fruit develop large, firm, bumpy, golden-brown to dark lesions with greasy surfaces.",
            "Rapid total collapse of the plant canopy within days."
        ],
        "causes": [
            "Oomycete pathogen: Phytophthora infestans.",
            "Windblown sporangia carried over tens of miles.",
            "Thrives in cool, wet, humid weather (15°C–22°C, RH > 90%)."
        ],
        "severity": "critical",
        "management": [
            "Check local Late Blight Forecast/Decision Support Systems (e.g., BlightCast).",
            "If late blight is identified on a few isolated plants, pull them up immediately, seal in garbage bags, and dispose of off-site.",
            "Do not compost late blight infected vines."
        ],
        "prevention": [
            "Select resistant cultivars containing Ph-2 and Ph-3 resistance genes (e.g., Mountain Magic, Plum Regal, Defiant).",
            "Eliminate all volunteer potatoes and tomatoes within and around the property.",
            "Maximize spacing between plants (at least 60–90 cm)."
        ],
        "precautions": [
            "Late blight is a community disease; failure to manage it puts neighboring farms and gardens at catastrophic risk."
        ],
        "fertilizer_guidance": [
            "Avoid excessive nitrogen that leads to thick, slow-drying foliar canopies."
        ],
        "pesticide_guidance": [
            "Preventive protectants: Chlorothalonil or Mancozeb before any symptoms appear.",
            "Translaminar oomyceticides: Mandipropamid (Revus), Cyazofamid (Ranman), or Fluopicolide (Presidio).",
            "Always alternate FRAC codes to avoid selection for resistant strains."
        ]
    },

    # 31: Tomato Leaf Mold
    "Tomato___Leaf_Mold": {
        "symptoms": [
            "Pale green to yellow spots with indefinite borders on the upper leaf surface.",
            "Dense, olive-green to grayish velvety fungal mold on the lower leaf surface directly beneath yellow spots.",
            "Severe cases cause leaves to turn brown, curl, and drop, starting from the lower canopy."
        ],
        "causes": [
            "Fungal pathogen: Passalora fulva (syn. Cladosporium fulvum).",
            "Prevalent in high-tunnel and greenhouse tomato production where relative humidity exceeds 85%.",
            "Spores survive on greenhouse structures, stakes, and plant debris."
        ],
        "severity": "medium",
        "management": [
            "Increase greenhouse and tunnel ventilation by opening ridge vents and sidewalls.",
            "Run horizontal airflow (HAF) fans continuously to prevent leaf condensation.",
            "Prune lower suckers and leaves to open the canopy."
        ],
        "prevention": [
            "Grow leaf-mold-resistant tomato hybrids (look for 'Cf' resistance genes).",
            "Maintain night greenhouse temperatures slightly higher to keep relative humidity below 80%."
        ],
        "precautions": ["Avoid late afternoon watering in tunnels to prevent overnight moisture buildup."],
        "fertilizer_guidance": ["Provide balanced nutrition; avoid excessive soft growth from over-fertilization."],
        "pesticide_guidance": [
            "Apply copper octanoate, Chlorothalonil, or Polyoxin D (Oso) at early symptom onset."
        ]
    },

    # 32: Tomato Septoria Leaf Spot
    "Tomato___Septoria_leaf_spot": {
        "symptoms": [
            "Numerous small, circular spots (2–3 mm) with dark brown margins and sunken tan or white centers.",
            "Tiny black specks (pycnidia) clearly visible inside the center of each lesion with a hand lens.",
            "Lower leaves turn yellow, brown, and drop progressively from the ground upward."
        ],
        "causes": [
            "Fungal pathogen: Septoria lycopersici.",
            "Overwinters in solanaceous weeds (horsenettle) and crop debris.",
            "Splashed upward by rain and overhead sprinkler drops."
        ],
        "severity": "medium",
        "management": [
            "Remove lower infected leaves early in the morning during dry weather.",
            "Apply 8–10 cm organic or plastic mulch to create a physical barrier against rain splash from soil.",
            "Rake and destroy all tomato crop residue at season end."
        ],
        "prevention": [
            "Implement a strict 3-year crop rotation without solanaceous crops.",
            "Stake and prune plants to improve sunlight and air movement throughout the lower canopy."
        ],
        "precautions": ["Do not cultivate or walk through wet tomato rows."],
        "fertilizer_guidance": [
            "Maintain balanced soil fertility according to soil test recommendations."
        ],
        "pesticide_guidance": [
            "Apply protective fungicides like Chlorothalonil, Mancozeb, or copper hydroxide starting at transplanting."
        ]
    },

    # 33: Tomato Two-Spotted Spider Mite
    "Tomato___Spider_mites Two-spotted_spider_mite": {
        "symptoms": [
            "Fine yellow stippling or bronzing on upper leaf surfaces.",
            "Delicate silken webbing visible on leaf undersides, growing tips, and flower clusters.",
            "Leaves dry out, turn brown, and drop; severe infestations cause complete plant desiccation."
        ],
        "causes": [
            "Arachnid pest: Tetranychus urticae.",
            "Explodes during hot, dry, dusty weather (temperatures > 30°C).",
            "Overuse of broad-spectrum pyrethroid insecticides destroys natural predatory mite populations."
        ],
        "severity": "medium",
        "management": [
            "Spray plants with a strong stream of water to knock down mites and break web matrices.",
            "Release biological control predators such as Phytoseiulus persimilis or Neoseiulus californicus.",
            "Keep farm roads and field edges wet or vegetated to suppress dust."
        ],
        "prevention": [
            "Avoid broad-spectrum synthetic pyrethroids and organophosphates that cause spider mite flare-ups.",
            "Scout leaf undersides with a 10x hand lens twice weekly during dry hot periods."
        ],
        "precautions": ["Mites develop resistance to miticides very rapidly; never apply the same mode of action consecutively."],
        "fertilizer_guidance": [
            "Avoid over-applying nitrogen; succulent high-nitrogen leaves significantly accelerate mite egg production."
        ],
        "pesticide_guidance": [
            "Apply insecticidal soap or horticultural oil (1%–2% solution) with thorough under-leaf coverage.",
            "For severe outbreaks: Apply selective miticides such as Bifenazate (Acramite) or Spiromesifen (Oberon)."
        ]
    },

    # 34: Tomato Target Spot
    "Tomato___Target_Spot": {
        "symptoms": [
            "Small, pinpoint brown spots on leaves that enlarge into circular brown lesions with distinct concentric rings.",
            "Lesions develop a halo of yellow chlorosis and cause premature defoliation.",
            "Sunken, brown circular lesions on green and ripe fruit."
        ],
        "causes": [
            "Fungal pathogen: Corynespora cassiicola.",
            "Favored by warm temperatures (25°C–32°C) and extended leaf wetness.",
            "Survives on solanaceous, cucurbit, and legume crop debris."
        ],
        "severity": "medium",
        "management": [
            "Prune out inner canopy foliage to reduce relative humidity inside rows.",
            "Avoid overhead irrigation."
        ],
        "prevention": [
            "Rotate crops out of tomato, pepper, and cucumber for at least 2 years.",
            "Maintain wide plant spacing and drip irrigation."
        ],
        "precautions": ["Target spot symptoms closely resemble Early Blight; accurate diagnosis ensures proper fungicide selection."],
        "fertilizer_guidance": ["Maintain balanced potassium levels to minimize foliar stress."],
        "pesticide_guidance": [
            "Apply Famoxadone + Cymoxanil (Tanos), Boscalid (Endura), or Chlorothalonil every 7–14 days."
        ]
    },

    # 35: Tomato Yellow Leaf Curl Virus
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": {
        "symptoms": [
            "Severe stunting and erect 'bushy' habit in young tomato plants.",
            "Leaves are markedly reduced in size, with upward curling ('cupping') and prominent chlorotic margins.",
            "Heavy flower abortion; virtually no marketable fruit formed if infected early."
        ],
        "causes": [
            "Viral pathogen: Begomovirus (Tomato Yellow Leaf Curl Virus).",
            "Transmitted persistently by the silverleaf whitefly (Bemisia tabaci).",
            "Not seed-borne and not mechanically transmitted by handling."
        ],
        "severity": "critical",
        "management": [
            "Rogue out and destroy infected plants immediately upon early symptom recognition.",
            "Place yellow sticky traps throughout the crop to monitor whitefly adult populations.",
            "Install 50-mesh insect-proof screening on greenhouse vents."
        ],
        "prevention": [
            "Plant TYLCV-resistant tomato hybrids (look for 'TY' resistance designation).",
            "Use UV-reflective silver plastic mulches to deter whitefly landings.",
            "Observe a strict 2-month host-free crop break between tomato seasons."
        ],
        "precautions": [
            "There is no chemical cure for viral infections. Managing the whitefly vector is the only defense."
        ],
        "fertilizer_guidance": [
            "Provide optimal micro-nutrients to support vigor of tolerant cultivars."
        ],
        "pesticide_guidance": [
            "Control whitefly vectors: Apply systemic neonicotinoids or Diamides (Cyantraniliprole) at transplanting.",
            "Foliar: Rotate with Spirotetramat (Movento) or Pyriproxyfen insect growth regulators."
        ]
    },

    # 36: Tomato Mosaic Virus
    "Tomato___Tomato_mosaic_virus": {
        "symptoms": [
            "Mottling of leaves with alternating light green and dark green mosaic patches.",
            "Distortion, blistering, and 'shoestring' narrowing of leaflets.",
            "Uneven fruit ripening with internal brown vascular necrosis."
        ],
        "causes": [
            "Viral pathogen: Tobamovirus (Tomato mosaic virus - ToMV).",
            "Extremely stable virus transmitted mechanically on hands, pruning tools, and tobacco products.",
            "Can be seed-borne in seed coat."
        ],
        "severity": "high",
        "management": [
            "Wash hands thoroughly with soap or 20% non-fat dry milk solution before handling tomato plants.",
            "Prohibit tobacco use anywhere near tomato production areas.",
            "Dip pruning knives in 10% TSP (Trisodium Phosphate) or bleach between every single plant."
        ],
        "prevention": [
            "Plant ToMV-resistant cultivars (designated by 'T' or 'ToMV' on seed packets).",
            "Use certified virus-free seed treated with trisodium phosphate or heat.",
            "Remove and incinerate any stunted or mosaic-mottled plants immediately."
        ],
        "precautions": ["The virus survives for years in dry plant debris and soil roots."],
        "fertilizer_guidance": ["Maintain steady nutrition to support overall plant vigor."],
        "pesticide_guidance": [
            "Pesticides have no effect against viruses. Focus 100% on hygiene and resistant genetics."
        ]
    },

    # 37: Healthy Tomato
    "Tomato___healthy": {
        "symptoms": ["Vibrant deep green foliage, robust indeterminate growth, clean yellow flowers, uniform fruit set."],
        "causes": ["Good field hygiene, optimal drip fertigation, proper staking, and balanced climate conditions."],
        "severity": "none",
        "management": ["Prune suckers regularly to maintain single or double leader vine structure on trellises."],
        "prevention": ["Mulch ground and scout under-leaf areas weekly for early hornworm or aphid colonies."],
        "precautions": ["Avoid sprinkler watering to preserve healthy foliar surfaces."],
        "fertilizer_guidance": [
            "Fertigate with balanced N-P-K (e.g. 5-11-26 or 4-18-38) with supplemental calcium nitrate and magnesium sulfate."
        ],
        "pesticide_guidance": ["No chemical pesticides needed. Conserve predatory bugs and bumblebee pollinators."]
    }
}


def run_seed():
    print("Initializing MongoDB indexes...")
    init_db_indexes()
    db = get_db()

    from backend.database.crop_catalog_data import CROPS_CATALOG

    print(f"\n--- Seeding {len(CROPS_CATALOG)} Crops across 7 Categories ---")
    crop_id_map = {}
    ai_supported_count = 0
    non_ai_count = 0

    category_counts = {}

    for crop_data in CROPS_CATALOG:
        doc = CropRepository.upsert(
            name=crop_data["name"],
            category=crop_data.get("category", "Vegetable"),
            description=crop_data.get("description", ""),
            common_names=crop_data.get("common_names", [crop_data["name"]]),
            icon=crop_data.get("icon", "🌱"),
            scientific_name=crop_data.get("scientific_name", ""),
            ai_supported=crop_data.get("ai_supported", False),
            common_diseases=crop_data.get("common_diseases", []),
            health_indicators=crop_data.get("health_indicators", []),
            growing_season=crop_data.get("growing_season"),
            soil_requirements=crop_data.get("soil_requirements")
        )
        crop_id_map[crop_data["name"]] = doc["_id"]
        # Also map alternative common names for robust lookup
        for alt in crop_data.get("common_names", []):
            crop_id_map[alt] = doc["_id"]

        cat = crop_data.get("category", "Other")
        category_counts[cat] = category_counts.get(cat, 0) + 1

        if crop_data.get("ai_supported"):
            ai_supported_count += 1
            print(f"  [AI SUPPORTED]  {crop_data['name']} ({crop_data['category']}) -> ID: {doc['_id']}")
        else:
            non_ai_count += 1

    print(f"\nSummary of Seeded Crops: {len(CROPS_CATALOG)} total")
    print(f"  - AI-Supported Crops: {ai_supported_count}")
    print(f"  - Non-AI Supported (Catalog Only): {non_ai_count}")
    print(f"  - Categories breakdown: {category_counts}")

    print("\n--- Seeding Diseases & Agronomic Recommendations ---")
    seeded_diseases = 0
    seeded_recs = 0

    for idx, class_info in MODEL_CLASSES.items():
        model_class = class_info["model_class"]
        crop_name = class_info["crop"]
        condition = class_info["condition"]
        is_healthy = class_info["is_healthy"]
        severity = class_info["severity"]

        crop_id = crop_id_map.get(crop_name)
        if not crop_id:
            # Fallback checks
            if "Bell Pepper" in crop_name:
                crop_id = crop_id_map.get("Bell Pepper / Capsicum")
            elif "Grape" in crop_name:
                crop_id = crop_id_map.get("Grapes") or crop_id_map.get("Grape")
            elif "Corn" in crop_name or "Maize" in crop_name:
                crop_id = crop_id_map.get("Corn (Maize)") or crop_id_map.get("Maize / Corn")

        if not crop_id:
            print(f"  [!] Warning: Crop '{crop_name}' not found for class '{model_class}'")
            continue

        kb = KNOWLEDGE_BASE.get(model_class, {})
        symptoms = kb.get("symptoms", ["Leaves display normal physiological characteristics." if is_healthy else "Visual foliar anomalies detected."])
        causes = kb.get("causes", ["Optimal growth conditions." if is_healthy else "Pathogenic or physiological stress factors."])
        management = kb.get("management", ["Maintain standard scouting." if is_healthy else "Isolate and inspect affected zones."])
        prevention = kb.get("prevention", ["Continue good agronomic hygiene."])
        precautions = kb.get("precautions", ["Wear safety equipment when handling chemicals."])
        fertilizer_guidance = kb.get("fertilizer_guidance", ["Apply balanced N-P-K according to soil analysis."])
        pesticide_guidance = kb.get("pesticide_guidance", ["No chemical pesticides needed." if is_healthy else "Consult local extension officer for chemical selection."])

        # Upsert disease
        disease_doc = DiseaseRepository.upsert(
            crop_id=crop_id,
            model_class=model_class,
            name=condition,
            is_healthy=is_healthy,
            severity=severity,
            symptoms=symptoms,
            causes=causes
        )
        seeded_diseases += 1

        # Upsert recommendation
        RecommendationRepository.upsert(
            disease_id=disease_doc["_id"],
            management=management,
            prevention=prevention,
            precautions=precautions,
            fertilizer_guidance=fertilizer_guidance,
            pesticide_guidance=pesticide_guidance
        )
        seeded_recs += 1

    print(f"\nSeed completed successfully!")
    print(f"Total Crops in Database: {len(CROPS_CATALOG)}")
    print(f"Total Diseases / Conditions Seeded: {seeded_diseases}")
    print(f"Total Recommendation Documents Seeded: {seeded_recs}")


if __name__ == "__main__":
    run_seed()

