// Category prompts for aesthetic style, lighting, color palette, texture, mood,
// and photo style.
//
// IMPORTANT: Aesthetic entries should contain ONLY the core creative concept,
// mood, and narrative tone. Camera specs go in CameraType (framingComposition.js),
// lighting setups go in Lighting, color grades go in ColorPalette, and surface
// details go in Texture. Never create new `comprehensive: true` entries.
//
// Legacy `comprehensive: true` entries still exist and cause the prompt assembly
// logic to auto-exclude standalone Lighting, ColorPalette, and Texture
// categories. These should be decomposed into proper entries when touched.

export const Aesthetic = [
  {
    id: "aesthetic_001",
    title: "Hollywood Timeless Elegance",
    comprehensive: true,
    prompt: "Generate an image that embodies a radiant, sophisticated \"timeless elegance\" aesthetic, reminiscent of a high-end beauty campaign or a classic Hollywood portrait. This vibe elevates the subject's beauty beyond ordinary visual experience, conveying serene, healthy beauty with understated luxury. Lighting utilizes soft expansive studio lighting mimicking large parabolic softbox or beauty dish positioned slightly off-axis - primary light sculpts face with gentle yet defined highlights along cheekbones and forehead complemented by subtle fill light from below clamshell technique to lift shadows under eyes and chin creating radiant even illumination that defines bone structure without harshness - distinct yet soft catchlights in eyes giving them sparkle making gaze incredibly engaging and alive - subtle hair light from behind gently separates hair from background creating soft halo effect adding dimension and ethereal glow making hair appear exceptionally lustrous and voluminous. Color palette features sophisticated warm-neutral color grade meticulously calibrated for clean beauty aesthetic reminiscent of high-end fashion campaigns - skin tones rendered with natural luminous quality rich in subtle healthy undertones soft peaches warm roses avoiding any plastic overly smoothed or digitally flat appearance - overall color palette exhibits subtle natural saturation allowing colors to feel rich and true-to-life without being overly vibrant - deep velvety black providing classic contrast - luminous multi-dimensional golden blonde hair rendered with exceptional detail in waves and highlights complementing skin tone and overall warm-neutral palette. Textures rendered with exceptional almost tangible fidelity - silky waves of hair subtle texture of skin and soft fabric of top all viscerally tangible and highly detailed showcasing transformative capabilities of high-resolution sensor and critically sharp lens - tactile richness makes beauty feel real and inviting depth of detail often enhanced by photographic process.",
  },
  {
    id: "aesthetic_002",
    title: "1960s Mod Glamour Drama",
    comprehensive: true,
    prompt: "Generate an image that embodies a captivating \"1960s Mod Glamour\" or \"Retro Enigma\" aesthetic, characterized by a sophisticated, slightly melancholic allure and a distinct, almost cinematic visual quality that evokes timeless, iconic beauty. Lighting utilizes soft yet dramatic studio lighting reminiscent of classic portrait setups from 1960s - soft directional key light positioned slightly above and to side creating subtle elegant shadows that sculpt cheekbones and jawline with pronounced three-dimensionality - very soft fill light gently lifts shadows on opposite side ensuring detail preserved while maintaining depth creating sophisticated almost theatrical effect - prominent yet natural catchlights in eyes adding sparkle making gaze intensely engaging and alive - deep rich yet not completely black shadows in background retaining sense of texture and subtle gradations enhancing dramatic mood. Color palette features classic slightly cool-toned color grade reminiscent of iconic 1960s film photography Fuji Velvia 50 or Ektachrome emulation slightly desaturated - dark tones of hair and clothing rendered with rich inky depth providing strong contrast to pale skin - subtle brown tones of hair have luxurious sheen - overall palette leans slightly towards cooler blues and greens especially in shadows contributing to elegant slightly mysterious aura reminiscent of vintage studio portraits - skin tones rendered with flawless luminous finish appearing smooth and radiant hallmark of classic beauty photography. Textures rendered with exceptional fidelity - sleek strands of long hair and bangs intricate texture of thick eyelashes and precise eyeliner smooth porcelain quality of skin and subtle sheen of sheer black top all viscerally tangible and highly detailed showcasing transformative capabilities of high-resolution film scan or meticulously processed digital capture - tactile richness from softness of hair to boldness of makeup contributes significantly to Mod Glamour vibe.",
  },
  {
    id: "aesthetic_003",
    title: "Candid It-Girl Effortless Glamour",
    comprehensive: true,
    prompt: "Generate an image that embodies a candid, luminous 'it-girl' aesthetic, imbued with a sense of effortless glamour and intimate, spontaneous allure that enhances natural beauty and atmospheric glow beyond ordinary visual perception. Lighting utilizes mixed ambient indoor lighting primarily from overhead or indirect sources creating flattering soft glow - subtle hint of backlight from indistinct sources creates soft halo around hair or profile separating from background adding touch of ethereal mystery. Color palette features warm slightly desaturated color grade with subtle pink/peach tint reminiscent of popular social media filters that enhance natural warmth and glow - skin tones rendered with healthy luminous quality with subtle flush of pink on cheeks suggesting vitality and freshness - metallic shine of earrings and necklace have soft yet distinct glimmer indicating high-quality materials - lip gloss has wet reflective quality - overall color harmony warm and inviting contributing to sense of effortless chic and approachability characteristic of curated personal brand. Textures rendered with exceptional yet flattering fidelity - subtle sheen of skin individual strands of hair delicate lines on hand intricate details of earrings and slight shimmer of eyeshadow all clearly discernible showcasing camera ability to capture fine detail while maintaining polished aesthetic - level of detail especially in makeup and jewelry adds to perceived glamour.",
  },
  {
    id: "aesthetic_004",
    title: "Y2K Doll-Like Hyper-Feminine",
    comprehensive: true,
    prompt: "Generate an image embodying a \"Y2K Glamour Shots\" or \"early 2000s hyper-feminine internet aesthetic,\" characterized by an almost artificial, doll-like perfection and a playful, slightly exaggerated sensuality that pushes reality into a stylized, idealized realm. Camera captured on early 2000s consumer-grade digital camera low-megapixel point-and-shoot Canon PowerShot A-series from 2003 or webcam exacerbated by heavy flash - visible digital noise and slightly soft low-resolution quality characteristic of early digital cameras with pixelated softness - shallow unrefined depth of field with busy bokeh not creamy - background indistinct and overexposed forcing all visual attention onto heavily made-up faces. Lighting utilizes direct unfiltered harsh on-camera flash as primary light source with minimal ambient light - flash creates flat high-contrast illumination that eliminates natural shadows and contouring making faces appear two-dimensional and doll-like - intense almost glaring specular highlights on lips gloss eyes contact lenses and any reflective makeup stark and pronounced contributing to plastic or lacquered appearance central to Y2K glam vibe far exceeding natural light reflections. Color palette features high-saturation slightly cool-toned color grade with strong emphasis on bright almost artificial hues - skin tones rendered with exaggerated almost porcelain paleness often with subtle cool cast contributing to doll-like perfection - any blush or lip color vibrant and overtly applied - eye colors unnaturally vibrant and captivating almost glowing key element of Y2K aesthetic pushed by digital enhancement - overall image has high saturation and contrast making colors pop in way that feels almost synthetic and stylized reminiscent of early internet aesthetics and pop art. Textures rendered with smooth almost featureless skin for Y2K digital idealization - while there might be digital noise skin appears unnaturally smooth and poreless result of aggressive digital smoothing and blurring techniques common in early photo editing creating idealized almost airbrushed texture that doesn't exist in reality - texture of hair might also appear slightly processed and less natural.",
  },
  {
    id: "aesthetic_005",
    title: "Dreamy Bedroom Pop Pastels",
    prompt: "Generate an image that embodies a captivating \"ethereal doll-like beauty\" or \"dreamy bedroom pop\" aesthetic, infused with a delicate vulnerability and a stylized, almost otherworldly charm that enhances and idealizes reality beyond natural human perception. Color palette features soft warm-pastel color grade reminiscent of vintage slightly faded film stock Fuji Superia or custom dreamy LUT - overall color palette dominated by delicate pastels soft rosy pink muted greens and creams warm browns feeling subtly desaturated yet rich creating sense of sweetness vulnerability and gentle romance - skin tones rendered with luminous almost porcelain-like quality appearing fair and delicate but with natural subtle rosy undertones avoiding any overly yellow or gray casts - cohesive color harmony where all hues blend seamlessly creating unified dreamlike visual experience. Textures rendered with exquisite yet delicate fidelity - silky sheen of slip dress intricate embroidery soft flowing strands of hair and subtle texture of quilted bedding all viscerally tangible yet softly rendered - balance of detail and softness enhanced by camera contributes to overall delicate and luxurious feel inviting viewer into intimate space.",
  },
  {
    id: "aesthetic_006",
    title: "Serene Ethereal Natural Charm",
    prompt: "Generate an image embodying a serene, ethereal, and naturally captivating aura, infused with a timeless, nostalgic charm that feels both classic and intimately personal, elevating natural beauty beyond ordinary visual experience. Textures rendered with exceptional almost tangible fidelity - soft strands of hair delicate intricate pattern of lace collar smooth fabric of dress and blurred organic textures of foliage in background all viscerally tangible and highly detailed showcasing transformative capabilities of high-resolution sensor and critically sharp lens - tactile richness truly elevates image making it experience rather than just visual inviting viewer to appreciate every subtle detail of natural charm.",
  },
  {
    id: "aesthetic_007",
    title: "Cool Maritime Luxury Twilight",
    comprehensive: true,
    prompt: "Generate an image that embodies a \"cool, understated maritime luxury\" aesthetic, infused with a natural, almost candid celebrity allure and a serene, aspirational tranquility that elevates the scene far beyond raw visual perception. Lighting utilizes soft ambient natural light from golden hour or blue hour sky complemented by warm glow of subtle onboard lighting - soft diffused slightly directional light from twilight sky falling gently across face and body creating exquisitely flattering highlights that sculpt features with subtle three-dimensionality - subtle warm interior glow from ambient deck lighting creating beautiful contrasting interplay with cooler twilight tones adding sense of cozy opulence and depth - controlled soft specular highlights on polished surfaces having subtle yet crisp photographic sparkle communicating high-quality materials and luxurious environment. Color palette features sophisticated cool-dominant yet warm-balanced color grade reminiscent of high-fashion editorial shot at dusk - denim outfit ocean and cushions feature rich varied shades of blue denim blue sky blue deep navy vibrant yet slightly desaturated creating cohesive maritime palette that feels fresh and cool yet calming - warm glows from interior lights and natural skin tones provide subtle inviting counterpoints to dominant blues preventing image from feeling cold instead imbuing it with sophisticated warmth - skin tones rendered with natural luminous quality subtly enhanced to appear flawless yet authentic. Textures rendered with exceptional fidelity - soft worn denim of outfit subtle ripples of hair smooth polished wood of deck plush fabric of cushions and reflective surfaces of yacht equipment all viscerally tangible and highly detailed showcasing transformative capabilities of high-resolution sensor and critically sharp lens - tactile richness makes luxury feel real and immersive depth of detail often enhanced by photographic process to create almost palpable sense of being there.",
  },
  {
    id: "aesthetic_008",
    title: "Raw Indie Sleaze Rebellion",
    comprehensive: true,
    prompt: "Generate an image that embodies a raw, rebellious \"early 2000s indie sleaze\" or \"suburban angst\" aesthetic, charged with a sense of defiant youth and unfiltered authenticity. This vibe is not merely captured but aggressively amplified by camera characteristics creating visual narrative far more impactful than direct observation. Camera simulation utilizes early 2000s consumer-grade digital point-and-shoot camera with inherently limited dynamic range - highlights noticeably clipped and blown out shadows deep and slightly crushed losing detail in both extremes - this lack of subtle tonal gradation lending gritty almost unforgiving realism to scene mirroring raw unpolished emotion. Lens exhibits slight softness or imperfection in focus especially towards edges and potentially subtle chromatic aberration around high-contrast areas - these optical characteristics deliberately embraced to create authentic un-retouched feel suggesting moment caught spontaneously rather than meticulously posed. Lighting utilizes harsh direct on-camera flash overriding any natural ambient light - flash creates flat high-contrast illumination that eliminates natural shadows and contouring making scene appear two-dimensional and raw. Color palette features cool-leaning slightly desaturated color grade with distinct digital film simulation feel of early point-and-shoot cameras - colors lean towards cooler greens and blues in environment with bright whites appearing almost clinical due to flash - patterns retain their structure but with slightly desaturated muted feel evoking sense of suburban mundanity and mild detachment against which rebellious act stands out. Skin tones rendered with raw un-beautified quality showing natural imperfections and direct impact of flash avoiding any overly warm or soft appearance. Composition maintains full-body slightly low-angle perspective placing subject centrally with environment framing scene - pose casual and almost defiant enhancing sense of unfiltered authenticity and defiant youth.",
  },
  {
    id: "aesthetic_009",
    title: "Vintage Americana Film Warmth",
    comprehensive: true,
    prompt: "Generate an image that embodies an effortlessly cool, sun-drenched \"vintage Americana\" or \"indie film heroine\" aesthetic, infused with a compelling blend of confidence and subtle vulnerability. This vibe is not merely a snapshot of reality but is meticulously crafted and amplified by specific characteristics of analog film photography rendering scene that feels richer and more emotionally resonant than direct visual experience. Camera simulation utilizes 35mm film camera paired with fast prime lens utilizing warm-toned film stock - image exhibits beautiful organic fine-grained texture characteristic of film stock subtly visible across all tones imparting feeling of authenticity nostalgia and timelessness making image feel more tactile and real in artistic sense than perfectly smooth digital capture - grain adds layer of depth and character that naked eye does not perceive in real-time. Depth of field moderately shallow creating dreamy creamy bokeh that elegantly blurs background softly isolating subject drawing viewer's eye directly to expressive gaze and relaxed posture intensifying intimacy of moment far beyond what natural human vision would achieve - bokeh smooth and pleasing with subtle light transitions. Lens subtly introduces minimal optical imperfections like very gentle vignetting slight darkening towards edges and possibly soft organic flaring if bright light source is just out of frame - these subtle imperfections celebrated in film photography adding character and raw unpolished beauty that enhances indie film aesthetic unlike clinical perfection often sought in digital. Color palette features warm natural and subtly rich color grade directly mimicking color science of warm-toned film stock - skin tones rendered with exceptionally natural and luminous quality rich in subtle warm undertones making subject appear effortlessly radiant and healthy sun-kissed look that feels authentic - browns and earth tones rich warm and inviting creating grounded classic aesthetic - whites hold subtle warmth rather than being stark blending harmoniously with overall palette - excellent color separation allowing subtle greens and deep blacks to remain distinct yet harmonious contributing to overall visual richness. Composition maintains dynamic medium shot with subject positioned naturally within frame - car door or environment frames subject adding sense of candid intimacy. Textures rendered with exceptional almost tangible fidelity - soft suede of jacket fine ribbing of tank top subtle texture of denim sleekness of hair worn leather of car seats and subtle glint of metal details all viscerally tangible - textures from smooth skin to fabric's weave rendered with tactile precision by film and lens that transcends casual observation inviting closer more appreciative gaze that accentuates sensory richness of scene.",
  },
  {
    id: "aesthetic_010",
    title: "Ethereal Softness Curated Cool",
    comprehensive: true,
    prompt: "Generate an image that embodies a captivating \"ethereal softness meets curated cool\" aesthetic, infused with a delicate sense of intimate connection and an almost dreamlike quality. This vibe is not merely observed but is meticulously constructed and amplified by camera's precise rendering elevating scene beyond ordinary visual experience. Camera simulation utilizes high-end full-frame digital camera paired with fast wide-aperture prime lens - depth of field exceptionally shallow creating exquisite creamy almost painterly bokeh that completely melts background into soft indistinct wash of color and light - this extreme blur far more pronounced than human vision strategically isolates subject drawing intense focus to interaction creating intimate dreamlike envelope around scene - bokeh exhibits smooth perfectly circular out-of-focus highlights that subtly glow contributing to ethereal atmosphere making scene feel less like snapshot and more like cherished memory. Subject's face exhibits subtle micro-contrast and exceptional resolution rendering skin with luminous almost porcelain-like quality rich in delicate cool undertones subtle pinks cool beiges - this high fidelity to complexion hallmark of professional sensors and lenses enhances ethereal beauty making skin appear flawlessly smooth yet natural level of perfection often enhanced by camera's ability to see and render light on skin with extreme precision. Lens exhibits gentle flattering soft focus effect at wider apertures subtly softening sharp edges without losing crucial detail contributing to overall dreamlike aesthetic - slight natural vignetting around edges gently darkening corners to further draw focus inward. Lighting utilizes soft diffused ambient lighting from nearby window or large softbox creating gentle enveloping glow - light soft and exceptionally even across face minimizing harsh shadows creating sense of unblemished serenity - this flat but flattering light carefully controlled by camera to reduce imperfections making features appear smoother and more angelic - delicate yet distinct catchlights in eyes that sparkle with photographic pop indicating precise light direction - subtle specular highlights visible on glossy hair and fur catching light with soft sheen that communicates texture and life often more noticeable in high-quality capture than in real life - light illuminates hair and fur creating luminous sheen that highlights individual strands and hairs making them appear incredibly soft and tactile detailed rendering of texture testament to camera's sensor resolution and light gathering capabilities. Color palette features cool-toned slightly desaturated color grade reminiscent of modern minimalist aesthetic often seen in high-end lifestyle photography - overall color palette leans towards cool blues and desaturated neutrals creating sophisticated and calm atmosphere - deep navy combined with muted tones of background feels harmonious and understated - skin tones while cool maintain luminous quality appearing fair and delicate against dark hair and muted background precise rendering of skin tones crucial for ethereal effect - rich deep blacks in hair and clothing providing contrast and depth without being crushed camera's dynamic range preserves detail even in these dark areas. Composition maintains medium-close slightly off-center perspective placing subject's gaze directly at viewer with relaxed intimate pose conveying gentle connection - environment provides soft foreground element visual technique that guides eye directly to face reinforcing sense of intimate connection. Textures rendered with exceptional almost tangible fidelity - smooth delicate skin long silky strands of hair soft blurred fur and subtle details of background objects all viscerally tangible and highly detailed where in focus - tactile richness truly elevates image making it experience rather than just visual drawing viewer into serene and intimate world in way human eye without photographic enhancement would struggle to achieve.",
  },
  {
    id: "aesthetic_011",
    title: "Kawaii-Core Dream",
    comprehensive: true,
    prompt: "Generate an image that embodies a playful \"Kawaii-core\" meets \"Dreamy Soft Girl\" aesthetic, infused with an alluring innocence and a vibrant almost hyperreal pop sensibility. This vibe is not merely observed but actively constructed by camera's precise rendering and deliberate post-processing approach making scene feel more vibrant and stylized than natural perception. Camera simulation utilizes high-end full-frame mirrorless camera paired with fast prime lens - depth of field moderately shallow creating creamy yet subtly textured bokeh that gently blurs background - this effect more pronounced and aesthetically pleasing than natural human vision strategically isolates subject making them undeniable focal point while still allowing vibrant background to contribute to Kawaii-core theme without distraction - background blur exhibits soft pleasing out-of-focus highlights from internal lights creating subtle shimmering halo effect that enhances dreamy atmosphere. Subject's face exhibits excellent micro-contrast and resolution rendering skin with natural luminous quality rich in subtle undertones peachy warmth rosy blush avoiding any plastic or overly smoothed appearance - this high fidelity to natural yet subtly enhanced skin texture contributes to alluring innocence making complexion glow with almost ethereal quality that transcends typical real-life observation. Lens offers minimal distortion ensuring geometric integrity - very subtle vignetting might be present gently darkening corners to draw focus further inward enhancing intimacy and visual concentration. Lighting utilizes dynamic mixed lighting combining vibrant internal illumination with subtle ambient overhead lighting - primary light source emanates from bright colorful internal lights casting vibrant multi-hued glow onto subject from behind and to side creating dramatic rim lighting and colorful spill onto clothing and hair effect significantly amplified and stylized by camera's sensor and post-processing making colors feel more electric and saturated than they would appear to naked eye this pop of color crucial for Kawaii-core aesthetic - softer more diffused frontal fill light gently illuminates face ensuring it remains well-exposed and flattering creating subtle highlights that sculpt features without harshness camera's dynamic range ensures bright and dark areas are rendered with detail preventing blown-out highlights or crushed shadows in vibrant scene - controlled specular highlights on hair plastic surfaces and any subtle jewelry having crisp yet not overpowering photographic sparkle adding playful sheen that enhances overall vibrancy and perceived quality. Color palette features vibrant high-saturation color grade leaning towards bright pastel-infused palette reminiscent of Japanese aesthetic trends while maintaining sense of dreamy warmth - reds and pinks intensely saturated but maintain pastel-like softness creating vibrant backdrop that feels both energetic and whimsical - subject's white clothing remains clean and bright with subtle texture acting as luminous canvas for colorful light camera's color processing ensures these hues are rendered with almost painterly intensity that is beyond natural observation creating truly Kawaii feel - skin tones rendered with natural luminous quality with healthy subtle flush avoiding any overly desaturated or artificial appearance this fidelity to natural skin while subtly enhanced contributes to youthful and alluring innocence - overall image possesses subtle warmth making it inviting while vibrant background elements retain their pop this balance creates dreamy soft girl aesthetic with lively energetic undertone. Composition maintains dynamic slightly tilted perspective capturing subject from medium-full shot with engaging slightly coquettish pose looking directly at viewer with alluring yet innocent expression - environment frames subject adding playful context. Textures rendered with exceptional fidelity - light flowing fabric smooth plastic and intricate graphics subtle sheen of hair and texture of skin all viscerally tangible and highly detailed showcasing transformative capabilities of high-resolution sensor and sharp lens - tactile richness makes playful vibrant environment feel immersive and real depth of detail often enhanced by photographic process drawing viewer into charming world.",
  },
  {
    id: "aesthetic_012",
    title: "Red Carpet Regal",
    comprehensive: true,
    prompt: "Generate an image that embodies an ethereal \"Red Carpet Glamour\" meets \"Regal Serenity\" aesthetic, imbued with sophisticated elegance and captivating almost otherworldly allure. This vibe is not merely captured but is masterfully constructed by camera's precise technical choices and exquisite post-processing elevating scene far beyond natural human perception. Camera simulation utilizes high-end full-frame professional mirrorless camera paired with fast portrait prime lens - depth of field supremely shallow creating exquisite creamy painterly bokeh that melts background into soft dreamlike wash of diffused light and subtle texture - this intense visual isolation of subject far more pronounced than human vision directly amplifies regal serenity and captivating allure making them undeniable focal point of emotional and aesthetic power - bokeh exhibits perfectly circular soft-edged out-of-focus highlights from lighting subtly glowing to enhance luxurious ethereal atmosphere. Subject's face décolletage and intricate details of attire exhibit phenomenal micro-contrast and acutance perceived sharpness rendering every delicate feature every shimmering detail and every strand of hair with almost hyper-real yet beautifully smoothed fidelity - this level of detail especially fine separation of tones within subtle highlights and shadows hallmark of top-tier optics and sensors communicating pristine luminous beauty that feels both aspirational and intimately close - skin tones rendered with porcelain-like luminosity rich in subtle healthy undertones avoiding any plastic or overly smoothed appearance while still achieving flawless finish. Subtle lens compression inherent to prime portrait lens gently flattens perspective making environment feel intimately close rather than vast creating elegant sense of intimacy and grandeur as if subject is sole luminous presence within magnificent setting. Lighting utilizes soft directional ambient lighting mimicking elegant diffused event lighting or large soft studio light - light sculpts features and contours with exquisite gradual light fall-off creating profound sense of three-dimensionality and form that makes subject appear almost statuesque - this subtle transition from light to shadow far more nuanced than what eye typically registers drawing attention to composed expression and graceful lines of pose amplifying regal presence and luxurious texture of attire - controlled yet dazzling specular highlights on jewelry delicate details of attire and polished surfaces having photographic sparkle and gleam reflecting light with subtle shimmering quality that conveys exquisite craftsmanship and high-end materials visual cue of luxury significantly enhanced by camera's ability to capture intense light points - deep yet open shadows that retain significant color and textural information particularly in folds of attire and darker areas this high dynamic range rendering hallmark of professional sensors allowing darker areas of image to still reveal subtle details contributing to dramatic yet refined elegance. Color palette features sophisticated cool-toned yet luminous color grade meticulously calibrated to evoke high-fashion editorial aesthetic - overall color palette subtly desaturated allowing pale gold or warm tones of attire to truly sing against muted tones of background creating expensive and timeless aesthetic that feels more curated and artistic than direct unedited capture enhancing ethereal and glamorous aura - cool tones in background provide sophisticated contrast to warmth of skin and attire - skin tones rendered with porcelain-like luminosity rich in subtle healthy undertones cool pinks warm peaches avoiding any plastic overly smoothed or digitally flat appearance this fidelity to natural skin while subtly enhanced for flawlessness contributes to captivating beauty - deep red or vibrant lip color and precise definition of eyes provide striking yet harmonious contrast against pale skin and soft tones of attire this selective vibrancy draws viewer directly to captivating gaze deliberate photographic choice to intensify presence. Composition maintains medium-close slightly low-angle perspective allowing environment to rise behind subject emphasizing presence within luxurious setting - pose composed and elegant conveying sense of serene confidence and thoughtful grace. Textures rendered with exceptional almost tangible fidelity - delicate shimmering details and tulle of attire smooth dark sheen of hair polished cool surface of environment and subtle gleam of jewelry all viscerally tangible and highly detailed showcasing transformative capabilities of high-resolution sensor and critically sharp lens - tactile richness truly elevates image making it experience rather than just visual drawing viewer into luxurious environment and exquisite details of attire in way human eye without photographic enhancement would struggle to achieve.",
  },
  {
    id: "aesthetic_013",
    title: "Serene Alpine Mountain Escape",
    prompt: "Generate an image embodying a serene alpine luxury aesthetic where natural beauty meets sophisticated comfort evoking an effortless chic mountain escape. This captivating vibe is meticulously crafted to feel more idealized and harmonized than real-life perception — a visual experience that elevates every element into something aspirational yet intimately personal. The subject radiates warmth and approachability set against a majestic mountain backdrop with cozy layered attire that whispers of quiet luxury — every fold of knit fabric every delicate strand of hair rendered with tactile fidelity that feels almost hyperreal. The interplay of vast alpine grandeur with intimate personal warmth creates a powerful duality — the mountains frame the scene with imposing dramatic scale while the subject remains the radiant glowing center of the composition exuding natural beauty and refined ease. The overall emotional register reads as serene yet elevated — effortlessly chic without trying sophisticated without straining — as if this person simply belongs in this magnificent setting and the camera has merely confirmed what was already apparent. The image should feel like peering into a curated moment of privileged mountain escape where natural beauty and human warmth exist in perfect sophisticated harmony.",
  },
  {
    id: "aesthetic_014",
    title: "Gothic Grandeur Lone Wanderer",
    prompt: "Generate an image that embodies a striking gothic grandeur meets lone wanderer aesthetic evoking a sense of awe mystery and elegant solitude against an iconic architectural masterpiece. This powerful vibe pushes the boundaries of natural perception — the scene should feel more dramatically intense and emotionally resonant than what the naked eye would capture in the moment. A lone figure walks purposefully through a vast nighttime setting appearing small against a monumental gothic backdrop — the overwhelming scale of soaring architecture creates a visceral sense of awe while the solitary presence transforms that awe into something deeply personal and contemplative. Wet surfaces act as mirror-like planes multiplying the drama through shimmering reflections that add an almost magical ethereal quality to the atmosphere. The emotional register should convey elegant solitude without loneliness — this is not abandonment but chosen purpose a deliberate walk through grandeur with quiet confidence. The profound darkness of night serves not as emptiness but as a stage that amplifies every illuminated detail making the architecture and the figure's presence feel theatrical and timeless. The overall image should feel like a single frame from an epic film — the kind of shot that makes the viewer hold their breath and wonder about the story of the person who walks alone through such magnificent beauty at night.",
  },
  {
    id: "aesthetic_015",
    title: "Unbothered",
    comprehensive: true,
    prompt: "Generate an image that embodies highly specific and recognizable \"rich 2016 girl\" aesthetic characterized by aura of effortless unbothered affluence subtle trend-following and carefully curated candid vibe. This essence is not just depicted but actively constructed and amplified by camera's particular characteristics and prevailing photographic trends of that specific social media era making it instantly recognizable. Camera simulation utilizes popular high-end smartphone of era utilizing its native camera app with minimal external filters beyond what was trendy then - perspective is close-up slightly high-angle selfie creating intimate yet aspirational feel - slightly wider-than-natural field of view of typical smartphone front camera combined with close distance creates intimate but subtly distorted perspective characteristic of selfies shared widely on Instagram in 2016 - this specific distortion slightly larger forehead softer edges becomes part of aesthetic making subject feel both relatable it's selfie and aspirational she's beautiful despite it - early-to-mid 2010s smartphone computational photography often applied subtle almost imperceptible skin smoothing directly in-camera creating luminous almost pore-less skin texture highly desirable at time contributing to flawless and effortless aspect of rich girl aesthetic where perfection is implied without overt effort this isn't just natural skin it's digitally enhanced natural skin - while not extreme bokeh smartphone's rendering creates gentle non-distracting background blur that keeps focus entirely on subject emphasizing self-centric nature of rich 2016 girl content where presence is paramount. Lighting utilizes harsh direct frontal flash lighting characteristic of smartphone's on-board flash combined with subtle ambient room light - direct unsoftened frontal flash creates strong high-contrast highlights on face particularly on lips making them appear fuller and glossier and forehead - crucially this flash often results in pronounced yet not unsightly shadows under chin and around eyes and noticeable red-eye effect - far from being flaw this harsh unfiltered flash is signature element of rich 2016 girl aesthetic conveying unbothered attitude she's not trying too hard she's just living her glamorous life and flash is casual almost accidental capture of that it feels raw and authentic in its lack of professional lighting yet still highlights beauty - camera's processing in conjunction with flash produces high contrast between brightly lit areas and deeper almost inky shadows in dark hair and under jawline this dramatic contrast isn't just about light it's about edgy confident glamour trending at time making subject look sharp and assertive. Color palette features cool-toned slightly desaturated color grade with strong emphasis on rich blacks and subtle muted pastels - overall color palette cool and slightly desaturated particularly in whites of background making skin tones appear more luminous and features pop this cool cast was popular filter aesthetic on Instagram in 2016 conveying sultry modern and slightly detached allure highly fashionable making image feel less warm and more curated - blacks of long dark hair and jacket deep and rich absorbing light and creating strong sense of depth and sophisticated edge this intensity of black combined with cool tones contributes to polished yet edgy look - subtle lilac lace and golden yellow silk provide muted pastel accents offering delicate understated feminine contrast to harsh lighting and intense gaze these specific colors lilac lavender mustard yellow very much in vogue in 2016 subtly signaling awareness of and adherence to current fashion trends without being overtly flashy camera's rendering ensures these delicate colors retain softness even under direct flash. Composition maintains tight symmetrical close-up composition with face centrally framed demanding viewer's full attention - pose direct and unsmiling with full slightly parted lips enhancing intense gaze and vulnerable aspects. Textures rendered with exceptional fidelity - smooth almost porcelain quality of skin enhanced by computational smoothing delicate lace of camisole silky sheen of long straight dark hair and subtle fabric of jacket all viscerally tangible and highly detailed - this tactile richness especially contrast between soft skin and delicate lace heightened by camera's precise rendering under flash making image feel more sensually engaging and luxurious perfectly manicured nails small but significant detail often subtle marker of rich girl grooming.",
  },
  {
    id: "aesthetic_016",
    title: "Avant-Garde Subversive",
    comprehensive: true,
    prompt: "Generate an image that embodies surreal fashion-forward and subtly subversive \"avant-garde intimacy\" aesthetic not merely captured but meticulously constructed by camera's unique rendering which actively distorts and enhances reality to create heightened sense of conceptual art. Camera simulation utilizes medium format film camera paired with standard prime lens utilizing warm-toned film stock pushed one stop - image exhibits noticeable yet finely textured film grain characteristic of pushed medium format film this grain crucial it adds tangible tactile grittiness and sense of raw unfiltered reality that digital smoothness cannot replicate making surreal elements feel more grounded and impactful creating aura of classic high-fashion editorial from era where film was king - depth of field moderately shallow creating smooth slightly painterly bokeh that gently blurs background into indistinct wash of muted tones this subtle separation of subject from background while keeping both figures in zone of focus draws viewer's eye precisely to intimate interaction and unique facial adornment emphasizing conceptual elements with clarity unmatched by real-life casual viewing - natural lens compression of medium format prime lens subtly flattens perspective bringing two figures into closer more intimate relationship this compression enhances sense of intertwined presence and almost sculptural quality of interaction. Lighting utilizes dramatic directional hard light mimicking single focused strobe or strong window light creating high-contrast scene - light casts deep sharp-edged shadows that create strong graphic shapes and accentuate contours of bodies and unique facial embellishment this theatrical contrast far more pronounced than natural perception drawing intense attention to interplay of light and shadow critical for subversive and artistic vibe - crisp almost clinical specular highlights on skin metallic elements of facial adornment and subtle sheen of shirt fabric these highlights should have sharp almost reflective zing emphasizing texture and form with intensity that highlights meticulous details of styling - film's pushed dynamic range manages both bright highlights and deep shadows ensuring that even in darkest areas subtle detail and texture are retained creating rich moody depth that prevents scene from feeling flat or underexposed. Color palette features distinctly cool-toned slightly desaturated color grade characteristic of pushed film stock in certain lighting conditions - palette dominated by cool greys pale blues and muted greens with skin tones rendered with slightly pale almost porcelain quality emphasizing ethereal and stark beauty colors deliberately understated allowing form and concept to take precedence over vibrant hues - delicate floral pattern on skirt retains subtle desaturated warmth pinks reds providing delicate contrast to cool overall tone and hinting at hidden fragility or humanity within conceptual framing. Composition maintains tight intimate crop with slightly Dutch tilt focusing on intertwined figures from waist up - composition feels deliberate and artful emphasizing connection and conceptual elements. Textures rendered with exceptional almost tactile fidelity - subtle weave of light blue skirt delicate floral embroidery smooth skin metallic gleam of facial adornment and crisp slightly rumpled fabric of shirt all viscerally tangible and highly detailed - this textural richness amplified by film grain and sharp focus draws viewer into scene making intimate interaction feel more immediate and real despite its surreal elements creating immersive sensory experience that goes beyond mere observation.",
  },
  {
    id: "aesthetic_017",
    title: "Whimsical Ethereal Innocence",
    prompt: "Generate an image that embodies a Whimsical Ethereal Innocence with a subtly unsettling undertone reminiscent of a dreamlike fairy tale or classic art portrait. This aura is not merely captured but meticulously constructed by the camera's precise rendering which elevates the scene beyond ordinary visual experience giving it a timeless almost painterly quality. The fantastical elements should feel grounded yet magical creating a paradoxical dreamlike realism. The subject should appear within a contained dreamlike world as the sole captivating focus of a quiet narrative as if viewed through a flawless lens into another realm.",
  },
  {
    id: "aesthetic_018",
    title: "Haute Cuisine",
    comprehensive: true,
    prompt: "Generate an image that embodies exquisite haute cuisine elegance with artistic minimalist flair creating sense of delicate freshness and luxurious presentation that is meticulously crafted by camera's precise rendering elevating dish beyond mere food photography. Camera simulation utilizes high-end full-frame professional mirrorless camera paired with high-end macro lens - macro lens paramount for rendering every minute detail with hyper-realistic precision that naked eye would struggle to perceive in such clarity including translucent edges delicate textures tiny elements and subtle details - this extreme resolution and sharpness emphasize meticulous preparation and high quality of ingredients conveying sense of culinary artistry - depth of field extremely shallow creating exceptionally creamy smooth bokeh that gently blurs edges of plate and any background elements into soft ethereal wash this selective focus powerful photographic tool isolates dish as sole magnificent subject creating intimate almost reverent focus on beauty and texture distinction from how one would casually view dish - slight lens compression from macro lens subtly enhances two-dimensional presentation making arranged elements feel perfectly balanced and aesthetically flat akin to culinary painting. Lighting utilizes soft diffused overhead natural light or studio softbox lighting meticulously controlled to highlight textures without harsh shadows - light evenly diffused across entire dish but with micro-shadows subtly defining layers and delicate details this controlled lighting enhances perception of freshness and dimensionality making ingredients appear vibrant and recently prepared level of detail often lost in casual lighting - delicate specular highlights on moist surfaces glistening elements and tiny droplets having lustrous almost liquid sparkle indicating freshness and rich high-quality texture visually emphasized by camera's ability to capture subtle reflections - white ceramic plate rendered with exceptionally clean pure whites free from color casts emphasizing pristine nature of dish and elegant presentation. Color palette features clean cool-neutral color grade with selective vibrant pops aiming for highly refined and modern aesthetic - scallops appear pristine white with subtle almost translucent edges conveying delicate texture and freshness overall palette leans towards clean whites cool greys and vibrant jewel-toned purples of edible flowers - deep rich purple of edible flowers and jet black of caviar vibrantly saturated providing striking visual anchors and artistic pop against otherwise minimalist canvas this selective saturation draws eye to key elements highlighting decorative and flavorful roles - lime zest and olive oil droplets maintain natural bright green and golden-yellow hues serving as subtle fresh counterpoints within refined palette. Composition maintains perfectly symmetrical overhead flat lay composition placing dish centrally to emphasize artistic arrangement and precision. Textures rendered with exceptional almost tangible fidelity - smooth delicate surface of scallop slices firm yet yielding pearls of caviar soft fragility of edible flowers subtle zest of lime and smooth glaze of ceramic plate all textures magnified and enhanced by camera's macro capabilities allowing viewer to almost feel ingredients transforming dish into work of art subtle gold pattern on plate also rendered with crisp detail adding to overall sense of luxury.",
  },
  {
    id: "aesthetic_019",
    title: "Dynamic Urban Cinematic",
    comprehensive: true,
    prompt: "Generate an image that embodies dynamic almost cinematic \"urban freedom\" or \"ephemeral city life\" aesthetic capturing fleeting moment of natural chaos against iconic architecture vibe deeply enhanced by camera's ability to freeze motion and render atmospheric detail. Camera simulation utilizes high-speed professional camera paired with versatile medium telephoto zoom lens - camera's high shutter speed paramount for freezing frantic motion with absolute clarity capturing individual wingbeats and feather details impossible for human eye to track this creates powerful sense of dynamic energy and arrested chaos making moment feel more dramatic and impactful than real-time observation - lens renders scene with exceptional sharpness across wide plane of focus ensuring both nearest elements and architectural details are crisp this meticulous detail even in chaotic scene highlights grandeur of architecture and intricate patterns of stonework - telephoto lens compression crucial making elements appear much more densely packed and numerous than they would to naked eye this visually intensifies swarm effect creating more overwhelming and dramatic spectacle emphasizing sheer volume against monumental backdrop. Lighting utilizes soft overcast daylight providing even diffused illumination that enhances atmospheric qualities - soft flat light from overcast sky creates minimal harsh shadows allowing dark forms to stand out as stark dramatic silhouettes against bright uniform sky and pale stone this contrast visually striking and evokes sense of stark urban beauty deliberate photographic choice that might flatten details but enhances graphic impact - camera's high dynamic range ensures details retained in both bright sky avoiding blown-out whites and darker tones allowing for rich atmospheric rendering where subtle textures and tones preserved across entire scene adding to visual depth - light subtly picks up any atmospheric haze or moisture in air creating gentle almost ethereal quality that softens distant elements and contributes to ephemeral fleeting nature of moment. Color palette features cool-toned slightly desaturated color grade emphasizing monochrome beauty of urban environment with subtle natural accents - palette dominated by cool greys and off-whites of stone and overcast sky creating classic timeless urban feel elements themselves provide spectrum of dark greys and blacks contrasting sharply - despite dominant cool tones hints of muted greens from distant trees and subtle browns from bare branches visible grounding scene in natural reality and providing soft counterpoint to architecture - overall image has crisp yet not harsh contrast allowing elements to pop against lighter background while maintaining detail in architectural intricate carvings. Composition maintains dynamic low-angle composition looking up towards architecture with elements filling significant portion of frame creating immersive almost overwhelming visual experience architecture itself partially framed emphasizing monumental scale. Textures rendered with exceptional fidelity - ruffled feathers caught mid-flight rough-hewn texture of stone and subtle carvings all textures magnified and brought into sharp relief by camera's capabilities allowing viewer to almost feel movement and age of architecture level of detail and presence that transcends casual observation.",
  },
  {
    id: "aesthetic_020",
    title: "Serene Golden Hour",
    comprehensive: true,
    prompt: "Generate an image that embodies serene naturalistic \"golden hour portraiture\" or \"effortless summer elegance\" aesthetic imbued with captivating sense of calm introspection and understated beauty. This vibe is not merely observed but meticulously crafted and enhanced by camera's sophisticated lens and sensor creating luminous visual experience that elevates scene beyond ordinary observation. Camera simulation utilizes high-end full-frame professional camera paired with fast portrait prime lens - depth of field exceptionally shallow creating exquisite velvety smooth almost dreamlike bokeh that melts background into soft ethereal wash of color and light this deliberate visual isolation of subject from surroundings far more pronounced and artistically controlled than human vision profoundly amplifies feeling of serene introspection and makes subject undeniable focal point of calm beauty drawing viewer deep into gaze - bokeh exhibits smooth perfectly rendered out-of-focus elements leaves distant structures that contribute to overall softness without being distracting - inherent lens compression of telephoto prime lens subtly pulls background elements closer to subject yet keeps them beautifully blurred this creates intimate sense of presence making subject feel nestled within environment rather than just placed in front of it enhancing naturalistic elegance. Lighting utilizes soft warm directional natural light specifically simulating golden hour late afternoon or early morning sun filtered through tree foliage - light falls gently across subject creating warm soft golden hour glow that imparts ethereal radiance to skin and hair this specific quality of light with elongated shadows and warm hue exquisitely rendered by camera's sensor imbuing entire scene with romantic almost magical quality that feels more intense and captivating than real-life observation - light creates perfect sparkling catchlights in eyes giving them depth and expressiveness simultaneously there should be gentle gradual light fall-off across form subtly sculpting features and adding profound sense of three-dimensionality that emphasizes relaxed pose and contemplative mood - camera's high dynamic range ensures both luminous highlights on face and subtle shadows cast by trees are rendered with rich detail and smooth transitions preventing any harsh clipping or crushing this fidelity to light provides luxurious depth to image. Color palette features sophisticated warm-neutral color grade meticulously calibrated to evoke color science of classic analog film - greens of grass and foliage rich vibrant and natural but with slightly subdued filmic quality creating lush backdrop that feels organic and inviting grass shows individual blades and tiny white flowers contributing to sense of untouched natural beauty - skin tones rendered with natural luminous warmth rich in subtle pinks and yellows appearing healthy and glowing without any artificiality this specific warmth contributes heavily to golden hour feel - entire color palette harmonious and inviting with subtle warmth that permeates scene creating sense of serene elegance and natural charm visually more cohesive and emotionally resonant than direct capture. Composition maintains low-angle slightly wide compositional perspective placing viewer at subject's level enhancing intimacy and naturalism of moment - pose languid and graceful with head resting on hand gaze directed softly towards viewer conveying serene confidence. Textures rendered with exceptional fidelity - soft skin delicate hair natural elements and fabric all viscerally tangible and highly detailed showcasing transformative capabilities of high-resolution sensor and sharp lens - tactile richness makes beauty feel real and immersive depth of detail often enhanced by photographic process.",
  },
  {
    id: "aesthetic_021",
    title: "Ethereal Forest Melancholia",
    comprehensive: true,
    prompt: "Generate an image that embodies profound \"ethereal forest melancholia\" or \"romantic nature muse\" aesthetic evoking sense of gentle introspection and organic beauty profoundly shaped by camera's unique optical and tonal rendering. This vibe is not merely captured but meticulously constructed by camera's sophisticated interpretation of light and texture creating visual experience far richer and more nuanced than human vision alone. Camera simulation utilizes medium format film camera paired with fast prime lens utilizing classic analog film stock - depth of field exceptionally shallow hallmark of medium format sensors and fast primes creating exquisite hyper-creamy bokeh that melts background into soft dreamlike wash of verdant greens and subtle light this extreme background blur far more pronounced and aesthetically pleasing than typical digital or human vision effectively isolating subject in pensive moment amplifying ethereal quality and creating intimate almost voyeuristic connection with viewer bokeh exhibits smooth perfectly rendered out-of-focus elements contributing to sense of serene beauty - image exhibits subtle organic texture of fine grain characteristic of film stock which provides tactile almost painterly quality to image making it feel timeless and nostalgic this filmic grain deliberate photographic artifact that softens digital harshness and adds layer of artistic authenticity contributing profoundly to romantic melancholic aura effect impossible to perceive in real life - lens renders gentle gradual fall-off from sharp focus to blur characteristic of high-quality prime lenses allowing viewer's eye to smoothly transition from subject's face to soft background this subtle optical effect enhances dreamlike quality making scene feel less like rigid photograph and more like fluid memory. Lighting utilizes soft diffused natural light filtering through dense forest canopy mimicking overcast day or golden hour in dappled shade - light gently illuminates face and hair creating soft luminous highlights that sculpt features with exquisite delicate dimensionality this nuanced light play captured with high dynamic range of film reveals subtle skin textures and individual curls of hair making subject feel almost otherworldly in natural setting camera captures and enhances these subtle glimmers in way that makes subject seem to glow softly - rich yet open shadows retain significant color and textural information particularly in darker parts of clothing and surrounding foliage this high fidelity in shadow detail strength of good film stock adds sense of mystery and depth to forest environment making it feel immersive and part of emotional landscape - light contributes to natural yet slightly idealized color rendition enhancing greens of foliage earthy tones of stones and vibrant hues rendering them with warmth and saturation that feels true to nature yet subtly more vibrant and harmonious than real-life perception. Color palette features soft warm-leaning color grade specifically emulating color science of warm-toned film stock known for beautiful greens and gentle skin tones - overall color palette subtly earthy and organic with greens that feel lush but not overly saturated and skin tones that are warm and natural this filmic color profile contributes directly to romantic naturalistic aesthetic making scene feel timeless and deeply connected to environment - skin tones rendered with delicate luminous quality rich in subtle natural blush tones and soft highlights avoiding any harshness this gentle rendering enhances fragile beauty and vulnerability. Composition maintains medium-close slightly low-angle composition drawing viewer intimately into space - pose with head resting gently on cairn of stones one of profound contemplation and gentle connection with nature. Textures rendered with exceptional almost tactile fidelity - soft unruly curls of hair rough varied surfaces of stacked stones intricate weave of plaid jacket and delicate details of moss and foliage in background all viscerally tangible and highly detailed this extraordinary textural richness enhanced by film's grain and lens's resolution creates immersive experience inviting viewer to feel natural elements and subject's place within them sensation far more profound than casual visual observation.",
  },
  {
    id: "aesthetic_022",
    title: "Raw Early Webcam Nostalgia",
    comprehensive: true,
    prompt: "Generate an image that embodies raw intimately awkward and deeply nostalgic \"early webcam/mid-2000s internet\" aesthetic evoking sense of casual vulnerability and unpolished self-expression. This vibe is entirely product of specific often technically limited imaging process creating visual experience far removed from how scene would be perceived by human eye. Camera simulation utilizes vintage low-resolution webcam specifically emphasizing its inherent technical constraints as aesthetic choices - image exhibits noticeable yet subtle pixelation and softness characteristic of low-megapixel sensors this isn't sharp modern clarity it's deliberate digital artifact that immediately transports viewer to earlier era of internet communication making image feel authentic to its niche it creates dreamlike slightly fuzzy quality that contributes to nostalgic vulnerability - visible digital noise chroma and luminance noise particularly in darker areas and flat tones furthermore subtle compression artifacts should be present especially around edges or areas of detail these imperfections crucial they are not errors but integral elements that lend raw unpolished and genuinely internet-native texture that human eye would never perceive in real life they contribute to image's grittiness and authenticity - camera exhibits limited dynamic range leading to areas where highlights are subtly blown out clipped to pure white without detail and shadows are slightly crushed losing detail in dark areas this lack of sophisticated light handling makes image feel stark and unfiltered amplifying sense of unflattering honesty and awkward vulnerability direct contrast to polished high-dynamic-range photography - perspective suggests fixed slightly wide-angle lens typical of webcams which can subtly distort facial features if too close contributing to awkward charm fixed focus means certain areas might be slightly soft adding to unpolished feel. Subject framed in medium-close shot looking directly at camera with intense slightly bemused yet deeply direct gaze holding pair of glasses in front of face in unconventional almost playful manner this expression amplified by camera's lo-fi quality conveys intimate awkwardness direct stare combined with slightly unusual pose feels deeply personal and little self-conscious common expression during early webcam interactions low fidelity of image enhances sense of raw unedited encounter - unfiltered vulnerability lack of photographic polish strips away artifice making emotional state feel more exposed and genuine image doesn't try to hide imperfections it embraces them making subject feel more relatable and vulnerable - subtle playfulness gesture with glasses adds touch of quirky playfulness hinting at personality despite serious gaze nuance that lo-fi aesthetic makes feel more spontaneous. Lighting utilizes harsh uneven and often unflattering indoor ambient lighting typical of dimly lit room with overhead artificial light - camera's low-light performance poor resulting in general flatness of light across scene with shadows that lack depth and highlights that lack nuance this absence of sophisticated light rendering contributes to raw unpolished and slightly depressing aesthetic - visible light bulb hanging from ceiling in background rendered as harsh almost blown-out point of light contributing to raw unfiltered quality of lighting. Color palette features slightly cool desaturated color grade with subtle green or magenta cast reminiscent of early digital sensors and display technologies - colors muted and slightly dull lacking vibrant saturation of modern cameras this contributes directly to nostalgic retro feel making image instantly recognizable as belonging to specific era - skin tones appear somewhat flat and lack luminous quality of high-end photography reflecting camera's limited ability to render subtle skin variations reinforcing unenhanced real aesthetic. Composition maintains straight-on static composition typical of fixed webcam view making image feel like unedited screen capture. Textures rendered with inherent noise and pixelation of low-res capture creating digital grain or texture across entire image that feels distinctly different from film grain this digital texture visible in hair sweater and background wall contributes heavily to image's unique lo-fi charm and tactile rawness effect entirely created by camera's limitations and processed in way human eye never perceives.",
  },
  {
    id: "aesthetic_023",
    title: "Early 2000s Indie Sleaze Suburban Angst",
    prompt: "Generate an image that embodies a raw rebellious \"early 2000s indie sleaze\" or \"suburban angst\" aesthetic charged with a sense of defiant youth and unfiltered authenticity. This vibe is not merely captured but aggressively amplified by the camera's specific characteristics creating a visual narrative far more impactful than direct observation.",
  },
  {
    id: "aesthetic_024",
    title: "Vintage Americana Indie Film Heroine",
    prompt: "Generate an image that embodies an effortlessly cool sun-drenched \"vintage Americana\" or \"indie film heroine\" aesthetic infused with a compelling blend of confidence and subtle vulnerability. This entire vibe is not merely a snapshot of reality but is meticulously crafted and amplified by the specific characteristics of analog film photography rendering a scene that feels richer and more emotionally resonant than direct visual experience.",
  },
  {
    id: "aesthetic_025",
    title: "Ethereal Softness Curated Cool",
    prompt: "Generate an image that embodies a captivating \"ethereal softness meets curated cool\" aesthetic infused with a delicate sense of intimate connection and an almost dreamlike quality. This distinctive vibe is not merely observed but is meticulously constructed and amplified by the camera's precise rendering elevating the scene beyond ordinary visual experience.",
  },
  {
    id: "aesthetic_026",
    title: "Kawaii-Core Dreamy Soft Girl",
    prompt: "Generate an image that embodies a playful \"Kawaii-core\" meets \"Dreamy Soft Girl\" aesthetic infused with an alluring innocence and a vibrant almost hyperreal pop sensibility. This distinct vibe is not merely observed but actively constructed by the camera's precise rendering and a deliberate post-processing approach making the scene feel more vibrant and stylized than natural perception.",
  },
  {
    id: "aesthetic_027",
    title: "Red Carpet Glamour Regal Serenity",
    prompt: "Generate an image that embodies an ethereal \"Red Carpet Glamour\" meets \"Regal Serenity\" aesthetic imbued with a sophisticated elegance and a captivating almost otherworldly allure. This profound vibe is not merely captured but is masterfully constructed by the camera's precise technical choices and exquisite post-processing elevating the scene far beyond natural human perception.",
  },
  {
    id: "aesthetic_028",
    title: "Early 2000s Indie Melancholy",
    prompt: "Generate an image that embodies an Early 2000s Indie aesthetic with fragile beauty and melancholic introspection evoking a powerful sense of nostalgic otherworldliness. The scene should feel like a still from an independent film — introspective and slightly distant inviting empathy. The stark contrast between dark attire and a single oversized white flower creates visual tension between delicacy and boldness. This image is perfectly suited for an independent film poster an alternative fashion editorial or an art photography series — designed to evoke fragile beauty melancholic introspection and nostalgic otherworldliness all intrinsically linked to the evocative and transformative magic of film photography.",
  },
  {
    id: "aesthetic_029",
    title: "Cozy Intimate Cat Bond",
    prompt: "Generate an image that embodies a warm sophisticated and intimately wholesome cozy chic aesthetic exuding genuine affection and aspirational home comfort with a beloved pet. This delightful vibe is not merely captured but meticulously crafted by the camera's thoughtful rendering which elevates the scene beyond ordinary visual experience enhancing emotional textures beyond natural perception — an intimate cozy authenticity imbued with a soft dreamlike melancholia and the comforting presence of a cherished companion. The subject's pose should be natural and affectionate conveying a deep bond of shared vulnerability and quiet affection — the kind of cherished memory that feels both aspirational and deeply relatable. Perfectly suited for a high-end lifestyle social media feed a pet-lover's blog a home decor blog or a pet enthusiast community — designed to project genuine affection sophisticated comfort and aspirational yet approachable elegance.",
  },
  {
    id: "aesthetic_030",
    title: "Serene Rustic Film Melancholy",
    prompt: "Generate an image that embodies a serene idyllic and gently melancholic aura that feels authentically captured through a seasoned lens. The scene evokes rustic warmth — a woman seated on a weathered wooden porch in soft natural light — creating a quiet moment that feels timeless and deeply nostalgic. The overall atmosphere should feel like a cherished analog photograph discovered in an old shoebox — imperfect beautiful and emotionally resonant.",
  },
  {
    id: "aesthetic_031",
    title: "Ethereal Doll-Like Vulnerability",
    prompt: "Generate an image that embodies an ethereal doll-like intensity with a tangible nostalgic aura of hyper-real vulnerability and cultivated innocence that feels physically captured. The subject reclines on a bed gazing directly at the viewer with an unsettling yet captivating directness — her long hair fanned around her — her presence simultaneously fragile and commanding. The image should feel like it exists in a liminal space between fantasy and reality where innocence becomes its own form of power.",
  },
  {
    id: "aesthetic_032",
    title: "Japandi Focused Productivity",
    prompt: "Generate an image that embodies a serene focused productivity and aspirational comfort aesthetic achieved through the clean almost luminous rendering characteristic of modern high-quality digital photography — subtly enhancing reality to create an inviting inspiring atmosphere. The environment reflects a blend of Japanese and Scandinavian design characterized by natural materials craftsmanship simplicity and a calm uncluttered aesthetic. Rattan elements natural wood and minimal decor point to thoughtful curated living. The subject radiates engaged intelligence and calm efficiency — the subtle glow from a laptop screen casts a cool reflection on face and hands indicating engagement with the digital world — an approachable radiance that communicates both diligence and genuine contentment.",
  },
  {
    id: "aesthetic_033",
    title: "Flow State Graceful Command",
    prompt: "Generate an intimate hyper-realistic photograph that captures the graceful flow of a woman's deep focus — a quiet powerful moment of connection between thought and action rendered with elegant clarity. The subject is captured in a state of flow her body forming a graceful engaged curve as she works at a whiteboard. Her posture is one of balanced intention — there is energy in her extended arm but also poise in her stance. It is the posture of a dancer not a soldier — a moment of serene command. The camera captures the subtle fluid energy in her movement — the gentle tension in her shoulder the confident grip on the marker the calm intensity of her expression. The final image should radiate calm power focused grace and a sense of seamless flow between idea and execution. The technical prowess of the camera is used not to dominate the scene but to serve the beauty and clarity of the moment.",
  },
  {
    id: "aesthetic_034",
    title: "Whiteboard Biomechanical Engagement",
    prompt: "A woman in an engaged dynamic pose leaning into a whiteboard arm extended mid-stroke. Convey musculoskeletal tension and balance — the extension of the arm the tilt of the torso the grounding of the feet. Capture the biomechanics of focused physicality. The image communicates focused clarity through physically accurate rendering of human posture optical properties and material interactions. Her top is a dark matte-finish fabric emphasizing the clean lines of her pose avoiding distracting reflections — bottoms are medium-toned trousers with subtle texture for visual separation.",
  },
  {
    id: "aesthetic_035",
    title: "Relatable Tech Dilemma Pondering",
    prompt: "Generate an image that embodies a relatable tech dilemma and approachable intellectual struggle aesthetic achieved through the candid yet subtly refined rendering characteristic of modern social media photography where everyday moments are elevated by digital capture creating a connection that feels both immediate and enhanced. The subject sits on a couch or comfortable surface with a laptop conveying a moment of deep thought and genuine pondering — the viewer feels directly present in the room with her. The scene feels like a genuine moment of intellectual engagement where the dilemma is universal rather than dramatic.",
  },
  {
    id: "aesthetic_036",
    title: "Optimized Reality Computational",
    prompt: "Generate an image embodying an optimized reality aesthetic — the clean hyper-detailed and perfectly balanced look of modern computational photography. The scene should feel authentically relatable yet subtly enhanced. The subject is actively working on a laptop on a bed — her focus entirely on the screen not posing for the camera. The framing feels candid not staged. Every detail is crisper than real life — individual laptop keys the weave of her cotton shirt the pattern of the bedsheets the texture of white curtains — flawless computational HDR ensures the window light is bright but retains full detail while the room's shadows are open and detailed not black. No blown-out highlights or crushed shadows anywhere.",
  },
  {
    id: "aesthetic_037",
    title: "Timeless European Elegance Contemplative",
    prompt: "Generate an image that embodies a profound timeless European elegance and contemplative cultural immersion aesthetic achieved through hyper-realistic and artistically enhanced rendering characteristic of high-end professional photography meticulously designed to evoke nostalgic beauty that transcends everyday visual experience. The subject stands elegantly against an ancient stone wall with an illuminated mosaic behind her — a pristine attire creating dialogue between modern elegance and the historic setting. The scene evokes sophisticated travel and cherished cultural memory — perfectly suited for a high-end fashion editorial luxury travel blog or artistic social media feed.",
  },
  {
    id: "aesthetic_038",
    title: "Serene Contemplation Natural Elegance",
    prompt: "Generate an image that embodies an exquisite serene contemplation and natural elegance aesthetic — a visual experience far richer than natural human perception. The subject is captured in side profile gazing downward in a private introspective moment surrounded by vibrant yellow flowers and lush green foliage. There is an intimate sense of harmony between her figure and the natural world — she is intrinsically connected to her surroundings. The scene radiates quiet dignity refined beauty and an almost spiritual calm.",
  },
  {
    id: "aesthetic_039",
    title: "Dreamy Naturalism Hammock Reverie",
    prompt: "Generate an image that embodies a profound dreamy naturalism and serene contemplation aesthetic achieved through the organic and subtly enhanced rendering characteristic of analog film photography evoking a mood far richer and more introspective than direct real-life observation. The subject reclines languidly in a hammock looking upward with a pensive expression — the surrounding trees and dappled light creating a lush natural cocoon. The scene feels like a cherished memory of a warm afternoon suspended in time — intimate timeless and profoundly peaceful.",
  },
  {
    id: "aesthetic_040",
    title: "Mystical Nature Siren Forest Nymph",
    prompt: "Generate an image that embodies an ethereal mystical nature siren or dreamlike forest nymph aesthetic — deeply artistic and almost surreal rendering that transcends natural observation imbuing the scene with magical realism that is purely photographic. The subject gracefully reclines on a large tree branch looking upwards and shielding her eyes from an unseen light — her flowing white dress contrasting against the dark ancient bark. The branch diagonally bisects the frame adding dynamic interest. The scene feels like stepping into an enchanted forest where she exists as a figure suspended between worlds — the environment alive with quiet ancient energy.",
  },
  {
    id: "aesthetic_041",
    title: "Ethereal Naturalism Dreamy Innocence",
    prompt: "Generate an image that embodies profound ethereal naturalism and dreamy innocence aesthetic achieved through nuanced almost painterly rendering characteristic of high-end artistic film photography capturing and enhancing light and texture in ways that transcend ordinary perception. Presented as a diptych — top panel is a medium-close portrait with her hand gently cupping her cheek eyes gazing with a soft inviting yet subtly melancholic expression — bottom panel is a medium-full shot capturing her seated or crouching in rich textured grass contemplating gently. Both panels share the same dreamy grass-and-light environment creating a cohesive narrative of tender vulnerability and timeless innocence.",
  },
  {
    id: "aesthetic_042",
    title: "Ethereal Wildness Romantic Melancholy",
    prompt: "Generate an image that embodies profound ethereal wildness and romantic melancholy aesthetic achieved through nuanced and artistically interpretive rendering characteristic of high-end analog-inspired photography. The subject stands centrally framed among tall swaying grasses in a vast open field — her gaze direct and intense yet her expression holds subtle vulnerability and quiet strength. Wind catches her hair and dress creating dynamic movement. The scene evokes untamed elegance a quiet strength and the poetry of standing alone in a wild landscape — romantic melancholy mixed with fierce independence.",
  },
  {
    id: "aesthetic_043",
    title: "Regencycore Neo-Classical Romance",
    prompt: "Generate an image that embodies an ethereal Regencycore or Neo-Classical Romance aesthetic evoking wistful elegance and timeless beauty. The subject is captured in classical profile gazing softly into the distance — pearl earrings an ornate hair barrette a delicate antique fan and lace-ruffled white blouse establishing period authenticity. The composition feels like a historical painting come to life — aristocratic yet tender with an almost sculptural quality. The scene radiates romantic longing and gentle feminine grace suggesting a private moment of contemplation in an age of elegance.",
  },
  {
    id: "aesthetic_044",
    title: "Melancholic Muse Indie Film Noir",
    prompt: "Generate an image that embodies a hauntingly ethereal melancholic muse or indie film noir aesthetic infused with raw vulnerable intimacy and a striking almost painterly quality. The subject leans against a cool-toned wall wearing a black dress with a large soft white flower on her chest — her expression intense and direct yet slightly averted conveying vulnerability introspection and perhaps a hint of sadness. A strong intentional blue color cast dominates the background creating an ethereal cold almost ghostly atmosphere. The scene feels like a frame from an early 2000s indie film — beautiful but heavy with unspoken emotion.",
  },
  {
    id: "aesthetic_045",
    title: "Cottagecore Celebrity Spring Enchantment",
    prompt: "Generate an image that embodies a joyful whimsical cottagecore celebrity or effortless spring enchantment aesthetic radiating genuine happiness and charming approachable warmth. The subject sits joyfully on the grass in a charming outdoor enclosure — head tilted back in uninhibited laughter holding an adorable rabbit close — wearing a floral dress with jewelry catching the light. The scene radiates pure joy enchanting beauty and aspirational carefree elegance — a tender private interaction elevated by golden warmth and soft natural light into something magical.",
  },
  {
    id: "aesthetic_046",
    title: "90s Supermodel Editorial Cool",
    prompt: "Generate an image that embodies a classic 90s supermodel aesthetic characterized by understated elegance subtle sensuality and a raw yet refined editorial mood. The subject holds a bouquet of roses wrapped in kraft paper against her chest — wearing a soft knit sweater and matching hat — her expression slightly detached and cool conveying effortless confidence. The scene evokes iconic fashion photography of the era — timeless glamour with that particular 90s mix of vulnerability and unattainable beauty.",
  },
  {
    id: "aesthetic_047",
    title: "Golden Hour Nostalgia Road Trip",
    prompt: "Generate an image that embodies a Golden Hour Nostalgia or Dreamy Road Trip aesthetic radiating gentle warmth introspective beauty and spontaneous charm. The subject sits in the back seat of a car bathed in rich golden hour backlight — her hair glowing with an almost ethereal halo — holding a soft pink lily. The scene feels like a cherished memory of a road trip — romantic hazy and impossibly warm — the kind of moment that exists more beautifully in photographs than it did in real life.",
  },
  {
    id: "aesthetic_048",
    title: "Effortless Chic Naturalistic Edge",
    prompt: "Generate an image that embodies a raw naturalistic effortless chic aesthetic infused with subtle classic fashion editorial edge and quiet contemplative intensity. The subject wears a luxurious fur coat — her gaze carrying raw elegance and natural beauty. The scene conveys that rare quality where high fashion meets authentic unposed reality — the subject is magnetic not because she is performing but because she simply is. A foreground element slightly out of focus frames her organically adding depth and intimacy.",
  },
  {
    id: "aesthetic_049",
    title: "Raw Editorial Windswept Vulnerability",
    prompt: "Generate an image that embodies a powerful raw editorial windswept vulnerability aesthetic infused with untamed natural beauty and subtle melancholic glamour. The subject stands in the crashing ocean waves — white dress soaked and clinging — head tilted back hair flying — a dynamic mixture of vulnerability and liberation against the powerful sea. The scene feels like a high-fashion editorial that captures genuine wildness — the subject not merely posing in nature but being consumed and elevated by it.",
  },
  {
    id: "aesthetic_050",
    title: "Ethereal Wilderness Couture",
    prompt: "Generate an image that embodies a breathtaking ethereal wilderness couture aesthetic blending high fashion with the raw majestic beauty of nature imbued with graceful resilience and sublime artistry. The subject stands against a vast mountain and lake landscape wearing elegant couture — intricate lace gloves a plush wool coat. The scene feels like where the runway meets the raw edge of the world — fashion and wilderness in perfect tension — sublime grandeur meets human elegance.",
  },
  {
    id: "aesthetic_051",
    title: "Dreamy Summer Nostalgia Bohemian",
    prompt: "Generate an image that embodies a serene ethereal dreamy summer nostalgia or bohemian wanderlust aesthetic — timeless almost painterly quality that transcends real-life perception. Captured in a perfectly square aspect ratio for timeless artistic composition. The subject stands centered with the vast sky and clouds dominating the upper two-thirds of the frame — her gaze directed downward conveying quiet thought or gentle melancholy. The scene radiates contemplative freedom and idyllic summer beauty — as if she is a small serene figure against the infinite sky.",
  },
  {
    id: "aesthetic_052",
    title: "Late 90s Bohemian Chic Indie",
    prompt: "Generate an image that embodies a captivating late 90s early 2000s bohemian chic or effortless indie fashion editorial aesthetic infused with warm sun-kissed nostalgia and relaxed confident beauty. The subject sits comfortably on the grass looking directly at the camera with confident yet relaxed gaze — wearing a patchwork top and striped scarf in rich jewel tones teals reds yellows indigos paired with earthy khaki pants. The composition feels candid and unposed — the kind of perfectly imperfect moment that defined the era's aesthetic.",
  },
  {
    id: "aesthetic_053",
    title: "Summer Wanderlust Bohemian Dream",
    prompt: "Generate an image that embodies a captivating Summer Wanderlust or Bohemian Dream aesthetic infused with free-spirited allure and natural beauty. Shot from a low angle through a field of daisies looking upward — the subject is framed by wildflowers silhouetted against an expansive blue sky — looking back over her shoulder with an alluring direct gaze. The scene radiates freedom natural beauty and the magnetic energy of a perfect summer day — the kind of image that makes you ache for open fields and warm wind.",
  },
  {
    id: "aesthetic_054",
    title: "Forest Nymph Portra Warmth",
    prompt: "Generate an image that embodies a serene ethereal forest nymph or natural beauty aesthetic infused with profound nostalgic warmth and subtle dreamy vulnerability. The subject reclines gently on a grassy hill looking upward and away conveying thoughtful introspection and deep connection with nature. The surrounding trees grass and natural light create an immersive cocoon of organic beauty — the scene radiates timeless grace and the profound peace of being wholly present in the natural world.",
  },
  {
    id: "aesthetic_055",
    title: "Escapist Intellectual Vintage Adventure",
    prompt: "Generate an image that embodies a deeply introspective escapist intellectual aesthetic tinged with subtle almost vintage adventurous spirit. The subject sits in a compact boat cabin absorbed in reading — strong directional natural light streaming from a window creating dramatic contrast between bright pages and the cozy dark wood interior. A metallic fan a watch and a white mug ground the scene in tangible reality. The scene feels like a preserved moment from a past adventure — solitary intellectual escape in a floating sanctuary.",
  },
  {
    id: "aesthetic_056",
    title: "Urban Vulnerability Raw Introspection",
    prompt: "Generate an image that embodies a gritty urban vulnerability or raw intense introspection aesthetic capturing a moment of startled authenticity that feels deeply cinematic and psychologically charged. The subject is caught in a tight medium-close-up — hood framing her face — looking directly into the lens almost caught off guard. The expression is a complex mix of vulnerability surprise and defiance. The scene feels like a frame pulled from a neo-noir thriller — urban harsh yet deeply human.",
  },
  {
    id: "aesthetic_057",
    title: "Thoughtful Casual Cool Magnetic",
    prompt: "Generate an image that embodies a thoughtful casual cool or approachable intensity aesthetic infused with genuine vulnerability and understated magnetic presence. The subject wears a grey hoodie — her hand covering her mouth in a pensive gesture — her gaze direct intense and slightly searching. Shot against a pure white background — she appears to float in a space of pure thought. The scene distills personality to its essence — no environment no distraction just a human being caught in a moment of unguarded contemplation.",
  },
  {
    id: "aesthetic_058",
    title: "Late-Night Selfie Rebellious Confidence",
    prompt: "Generate an image that embodies a sultry intimate and slightly rebellious late-night selfie aesthetic infused with raw unfiltered confidence and a captivating gaze. The subject takes a close selfie — full expressive lips dark hair framing her face — wearing a yellow camisole with lavender lace under a dark jacket. Harsh overhead artificial lighting creates dramatic shadows and glossy specular highlights. The scene projects confident raw beauty and magnetic allure — the intimacy of a selfie shared with chosen few — unfiltered unapologetic and magnetic.",
  },
  {
    id: "aesthetic_059",
    title: "Romantic Grunge 90s Runway",
    prompt: "Generate an image that embodies a dreamy ethereal romantic grunge aesthetic reminiscent of a vintage 90s fashion show imbued with delicate vulnerability and understated allure. The subject walks a dimly lit runway in a flowing off-white slip dress with antique gold and cream lace trim — long brown hair subtly moving with her stride. The dark atmospheric background recedes into rich shadow making her the sole luminous figure. The scene evokes the peak of 90s fashion — when vulnerability was the ultimate luxury and imperfection was the highest form of beauty.",
  },
  {
    id: "aesthetic_060",
    title: "Golden Age Hollywood Mid-Century",
    prompt: "Generate an image that encapsulates a timeless Golden Age of Hollywood or Mid-Century European Cinema aesthetic infused with nostalgic romance serene natural beauty and playful elegance. The subject is gracefully positioned on a hillside overlooking a sweeping coastal vista — turning back toward the viewer with a gentle inviting smile holding a small flower — wearing an elegant period-appropriate dress. A subtle atmospheric haze softens the distant coastline. The scene feels like a frame from a 1950s European film — impossibly romantic and timelessly elegant.",
  },
  {
    id: "aesthetic_061",
    title: "Sun-Drenched Garden Reverie",
    prompt: "Generate an image that embodies a dreamy sun-drenched melancholia or ethereal garden reverie aesthetic — almost painterly nostalgic vision far richer and more evocative than real-life perception. The subject sits low in a garden among lush foliage — wet hair clinging to her skin — wearing a vibrant floral dress with pinks yellows and purples — her gaze directed downward and away in private introspection. Sun-dappled bokeh creates distinct soft circles of light in the background. A glass with condensation sits nearby. The scene captures that particular quality of a perfect summer afternoon where beauty and melancholy become indistinguishable.",
  },
  {
    id: "aesthetic_062",
    title: "Winter Spa Retreat Aspirational",
    prompt: "Generate an image that embodies a serene winter spa retreat aesthetic imbued with warmth tranquility and aspirational relaxation. The subject is partially submerged in an outdoor hot tub holding a book — abundant steam rising creates tangible sensory immersion — a low winter sun provides dramatic golden backlighting. The surrounding snow-covered landscape and cabin create a cozy contrast with the warm water. The scene is the ultimate aspirational escape — intellectual relaxation in nature's luxury — the cold air meeting warm steam meeting golden light.",
  },
  {
    id: "aesthetic_063",
    title: "Dreamlike Pastoral Romance Horse",
    prompt: "Generate an image embodying a profound dreamlike pastoral romance and ethereal nostalgia aesthetic — a cherished memory brought to vivid yet soft life. The subject gently rests on a white horse surrounded by soft golden-hour light and distant green foliage — wearing a delicate floral dress — her expression conveying profound peace and tender connection. A slightly off-center distant figure adds subtle narrative depth. The scene feels like a painting come to life — pastoral romantic and achingly beautiful.",
  },
  {
    id: "aesthetic_064",
    title: "Idyllic Sun-Drenched Escape",
    prompt: "Generate an image that embodies a serene idyllic sun-drenched escape aesthetic imbued with nostalgic almost dreamlike warmth and undisturbed tranquility. The subject reclines languidly on a swing couch in an expansive idyllic backyard — wearing a pastel pink slip dress against plush white cushions with a patterned outdoor rug below. Morning or late afternoon sunlight transforms the scene into an ethereal golden glow. A distant house and trees establish the private secluded retreat. The scene radiates pure comfort — the visual equivalent of a warm breeze and nowhere to be.",
  },
  {
    id: "aesthetic_065",
    title: "Sun-Drenched Flower Dream Intimate",
    prompt: "Generate an image embodying a sun-drenched dream of serene vulnerability and organic beauty. The subject lies among flowers and dry grass — intense golden-hour sunlight casting distinct shadow patterns of foliage across her face and body creating an artistic dappled effect. Highlights on her skin gently push toward being almost blown out creating an ethereal luminous glow. The scene captures that suspended moment where afternoon light turns a simple field into something sacred — intimate vulnerable and impossibly warm.",
  },
  {
    id: "aesthetic_066",
    title: "Folkloric Meadow Whimsical Nymph",
    prompt: "Generate an image that embodies a dreamy ethereal folkloric meadow aesthetic deeply infused with serene natural beauty and a whisper of magical realism. The subject nestles deep among tall grass and wildflowers — white and blue blooms surrounding her — her blonde hair catching the light with an almost incandescent glow — her face gently turned toward the viewer in intimate contemplative connection. The perspective is low placing the viewer directly within the flora. The scene feels like discovering a fairy tale figure who has always been there hidden among the wildflowers.",
  },
  {
    id: "aesthetic_067",
    title: "Whimsical Summer Escape Forest Path",
    prompt: "Generate an image that embodies a whimsical sun-drenched summer escape aesthetic reminiscent of a nostalgic indie film scene or carefree European holiday. The subject walks a tree-lined gravel path — wearing a white dress carrying a wicker basket — looking back over her shoulder to engage the viewer. Strong backlight filters through the dense canopy creating dramatic sun-drenched highlights and atmospheric haze. The path leads the eye deep into the frame creating a sense of journey and exploration. The scene radiates freedom joy and the magical essence of a perfect summer adventure.",
  },
  {
    id: "aesthetic_068",
    title: "Ethereal Melancholy Folkloric Spirit",
    prompt: "Generate an image that embodies a profound ethereal melancholy and folkloric wistfulness aesthetic where the subject appears as a lost spirit amidst nature. The subject wears a delicate flower crown — her gaze downcast and wistful conveying profound introspection — long flowing hair framing her face — faint wisps of smoke adding to the otherworldly atmosphere. The surrounding foliage is soft and diffused with subtle yellow wildflowers in the distance. The scene feels like encountering a melancholic forest spirit — beautiful sorrowful and existing in a space between the real and the remembered.",
  },
  {
    id: "aesthetic_069",
    title: "Lavender Fields Natural Allure",
    prompt: "Generate an image that embodies a serene ethereal natural beauty aesthetic infused with whimsical sun-kissed charm and slightly nostalgic dreamlike quality — an almost painterly editorial feel. The subject holds lavender blossoms close to her face — her soft direct gaze slightly alluring — subtle freckles and a healthy sun-kissed glow catching the golden light. A soft rim light creates an angelic halo around her hair. Distant trees and lavender fields provide a lush muted backdrop. The scene distills the essence of natural feminine beauty — effortless delicate and warmly luminous.",
  },
  {
    id: "aesthetic_070",
    title: "Gothic Vampire Romantic Tension",
    prompt: "Generate an image embodying a gothic romantic aesthetic — sharp contrast between pale almost luminous figures and a dark deep background creating immense visual drama. The subjects appear to glow making them the undeniable center of attention enhancing their iconic status. The combination of pale skin dark eyes and intense red lips against a somber backdrop evokes gothic romance forbidden desire and underlying tension. The man wears a desaturated cool khaki or grey-green unbuttoned shirt — the woman wears an off-white or very pale cream dress leaning cool. These tones create etherealness and seriousness. The scene heightens romance and tension — fragile luminous beauty against consuming darkness.",
  },
  {
    id: "aesthetic_071",
    title: "Kawaii Winter Wonderland Hyper-Sweet",
    prompt: "Generate an image that embodies a hyper-sweet Kawaii Winter Wonderland aesthetic infused with vibrant almost fantastical energy. The subject stands against snow-covered mountains and bright blue sky — arms thrown up in wild exuberance mouth open in a wide laugh hair flying — wearing a vibrant pink outfit. The scene is drenched in dazzling brightness — snow gleaming sky electric blue — everything pushed past natural saturation into an almost anime-like fantastical joy. Pure unadulterated exuberant happiness against pristine winter grandeur.",
  },
  {
    id: "aesthetic_072",
    title: "Regencycore Film Grain Ethereal",
    prompt: "Generate an image blending Regencycore elegance with the fragile ethereal quality of pushed film grain. The image exhibits a delicate organic film grain like Portra 800 or Fuji Natura 1600 pushed one stop — subtly visible across all tones adding a skin-like texture to the entire frame. This inherent grain softens edges and creates a dreamy timeless quality directly contributing to an ethereal fragile aura — making the image feel like a cherished memory rather than a digital capture. Combined with harsh yet artfully controlled direct flash photography the scene has an otherworldly tension between period elegance and raw photographic immediacy.",
  },
  {
    id: "aesthetic_073",
    title: "Exuberant Snow Day Joy",
    prompt: "Generate an image embodying an exuberant playful and slightly chaotic snow day joy aesthetic captured with raw unfiltered energy that feels both immediate and timeless. This dynamic vibe is intensely amplified by the camera's visceral rendering pushing the scene beyond passive observation into an immersive experience. The scene conveys frozen chaos — sharpness that freezes flying snow particles and the subject's energetic pose while the overall rendering retains a subtle inherent digital grittiness that prevents looking overly polished. This directly amplifies the feeling of exuberant joy and spontaneous play making the viewer feel almost physically present in the moment.",
  },
  {
    id: "aesthetic_074",
    title: "Kawaii Winter Wonderland Smartphone",
    prompt: "Generate an image embodying an exuberant playful hyper-cute Kawaii Winter Wonderland aesthetic infused with pure joy and a vibrant almost ethereal glow. This incredibly cheerful vibe is actively constructed by the camera's specific settings and aggressive beauty filter post-processing pushing visual impact beyond natural perception to create a stylized dreamlike reality. Deliberately pushed high exposure resulting in blown-out highlights on snow and skin creating an ethereal almost heavenly glow that feels far brighter and more magical than true-to-life. This controlled overexposure amplifies pure unadulterated joy and innocence.",
  },
  {
    id: "aesthetic_075",
    title: "Summer Wanderlust Bohemian Adventure",
    prompt: "Generate an image embodying a vibrant summer wanderlust and effortless bohemian adventure aesthetic where the scene feels like a cherished sun-drenched memory meticulously crafted by analog film simulation. The overall warmth combined with slightly desaturated yet rich colors immediately evokes nostalgia and timelessness — a cherished memory from a summer past. Golden yellows and bright whites convey powerful sunlight and warmth radiating optimism and carefree spirit. Colors vibrant enough to be engaging yet harmonized by muted greens and blues preventing harshness creating visually pleasing balanced energy.",
  },
  {
    id: "aesthetic_076",
    title: "Dreamy Mountain Wanderlust Freedom",
    prompt: "Generate an image embodying an ethereal nostalgic wanderlust freedom or dreamy summer adventure aesthetic feeling like a cherished slightly faded memory meticulously crafted by the camera's unique optical and chemical properties rendering beyond typical digital clarity. Overall dreamy softness and subtle blur particularly in the subject is a direct result of fixed often less-than-perfect point-and-shoot optics — not a digital blur filter but an inherent optical characteristic creating immediate nostalgia and dreaminess making the moment feel like a hazy recollection rather than sharp reality.",
  },
  {
    id: "aesthetic_077",
    title: "High-Fashion Editorial Powerful Gaze",
    prompt: "Generate an image embodying a sophisticated high-fashion editorial aesthetic with a powerful direct gaze and understated luxury. This vibe is meticulously sculpted by the camera's precise technical rendering elevating the subject's presence beyond casual observation. Ultra-shallow depth of field creates luxurious creamy almost painterly bokeh that completely melts the background into a soft indistinct wash of color. Pin-sharp acutance on key features renders every subtle nuance — from the glint in her eye to fine skin texture and polished gleam of jewelry — with tangible precision communicating high quality and meticulous styling.",
  },
  {
    id: "aesthetic_078",
    title: "Timeless Elegance Hollywood Portrait",
    prompt: "Generate an image embodying a radiant sophisticated timeless elegance aesthetic reminiscent of a high-end beauty campaign or classic Hollywood portrait. This vibe is meticulously constructed by the camera's sophisticated rendering and precise lighting elevating beauty beyond ordinary visual experience. Micro-contrast and acutance render skin with impeccable luminous quality that subtly smooths imperfections while retaining natural texture — perfected reality hallmark of high-end beauty photography making complexion appear flawless yet authentic glowing with internal light.",
  },
  {
    id: "aesthetic_079",
    title: "Earthy Nostalgic Vibrancy Wilderness",
    prompt: "Generate an image embodying profound earthy nostalgic vibrancy aesthetic infused with introspective calm and authentic wilderness-inspired beauty. This evocative aura is meticulously constructed and amplified by simulation of high-end analog photography transcending natural human perception delivering profound emotional and visual richness. The goal is a portrait feeling like a cherished memory imbued with timeless quality and tactile almost palpable presence. Subject angled dynamically perhaps leaning contemplatively against river stones or nestled within natural elements — gaze either directly at viewer with soft inviting intensity or introspectively averted conveying a private moment.",
  },
  {
    id: "aesthetic_080",
    title: "Vintage Film Color Shift Halation",
    prompt: "Generate an image with distinctive vintage 35mm film aesthetic featuring unique color shifts and halation effects. Colors possess a subtle color shift — gentle green or magenta cast in shadows with warm highlights — characteristic of specific expired or consumer film stocks. Subtle halation effect around bright light sources where light bleeds into adjacent darker areas creating soft dreamy glow that feels ethereal and nostalgic almost otherworldly. Slightly soft forgiving focus with subtle chromatic aberrations at high-contrast edges contributing to romantic dreamlike quality softening edges of reality enhancing vulnerability.",
  },
  {
    id: "aesthetic_081",
    title: "Antarctic Pristine Snow Grandeur",
    prompt: "Generate an image embodying pristine Antarctic snow grandeur with ethereal purity and intimate connection to vast polar landscape. Outstanding dynamic range handling vast expanse of white snow and ice — snow appears pristine and luminous almost glowing yet retains every subtle texture shadow and nuance without any blown-out areas. Impeccable highlight roll-off conveys pure untouched quality making scene feel more ethereal and perfect than how the eye might perceive harsh glare. Mid-telephoto compression gently brings distant mountains and ocean closer creating intimate sense of grandeur.",
  },
  {
    id: "aesthetic_082",
    title: "Perfect Essence Pristine Luxury",
    prompt: "Generate an image embodying perfect essence of pristine luxury — clean bright and exquisitely detailed where luxury is not just seen but felt. Unrivaled dynamic range ensures pristine luminous whites glowing with textural purity free from any blown-out hint yet retaining every delicate fold and nuance. Shadows rich deep and open revealing subtle color and textural information without crushing — profound sense of depth and realism. This meticulous highlight and shadow handling creates ethereal purity of light feeling almost heavenly surpassing natural human vision — cornerstone of the luxurious essence.",
  },
  {
    id: "aesthetic_083",
    title: "Wabi-Sabi Yūgen Japanese Stillness",
    prompt: "Generate a profound and serene photographic portrait embodying the Japanese aesthetic principles of Wabi-Sabi and Yūgen. The composition is a masterclass in Ma — negative space — with vast empty areas of textured wall surrounding the subject. Her pose is one of natural unforced stillness her body angled away while her face turns towards the lens — her gaze a direct quiet observation suggesting a vast unspoken internal world her lips neutral and slightly parted. The background is a minimalist weathered interior — a single bare window with a cracked pane revealing soft-focus overcast sky and pale plaster wall stained with subtle watermarks and ghosts of old paint. The overall mood is one of tranquil melancholy profound simplicity and deeply beautiful imperfection — a captured moment of Yūgen that feels more like a visual haiku than a photograph evoking a palpable sense of Mono no Aware — a gentle sadness for the impermanence of all things.",
  },
  {
    id: "aesthetic_084",
    title: "Smartphone Evening Street Allure Candid",
    prompt: "Generate an image capturing a subtly alluring and candid evening street portrait — a spontaneous moment rendered with naturalistic smartphone intimacy. The subject exudes a subtle confident allure with a soft yet direct gaze engaging the viewer. Her stance is relaxed yet poised with one hand delicately resting near her collarbone suggesting thoughtful self-assurance. The overall mood is one of quiet allure and contemporary chic — a blend of candid authenticity with curated elegance characteristic of sophisticated lifestyle aesthetic. Intimate isolation within an urban evening setting — faint light trails and softly blurred background enhancing her presence.",
  },
  {
    id: "aesthetic_085",
    title: "Film Editorial Urban Confident",
    prompt: "Generate an image with a confident artfully casual editorial mood captured with film-like richness. The aesthetic is sophisticated lifestyle or fashion photography — candid yet editorial. Vibrant slightly desaturated yet realistic rendering with strong light sensitivity and subtle grain characteristic of film. The subject projects natural confidence within an urban architectural context — the scene balances her presence with structural elements of gates walls and distant buildings. Contemporary style and natural beauty within an urban setting.",
  },
  {
    id: "aesthetic_086",
    title: "Vintage Filter Warm Contentment",
    prompt: "Generate an image evoking quiet contentment artistic appreciation and sophisticated casualness. The aesthetic is candid yet curated lifestyle photography with a warm intimate and authentic feel — subtle grain and nuanced light sensitivity from a digital camera with a slightly vintage or film-like filter. The mood is gentle and relaxed emphasizing the subject's engaging expression and natural pose as primary focal points.",
  },
  {
    id: "aesthetic_087",
    title: "2016 SoundCloud Flash Raw DIY",
    prompt: "Generate an image embodying a bold playful and distinctly hazy 2016 SoundCloud aesthetic — raw unfiltered energy and DIY visual culture. The vibe is brazen provocative and authentically unpolished with neon-lit blown-out imagery. Body language is relaxed yet assertive with casual swagger. A bedroom background — bed wall charts personal space — serves as mere suggestion of intimate personal environment barely visible through flash glare. The overall mood captures the edgy unvarnished essence of 2016 SoundCloud visual culture — personal snapshots that project confident fun and slightly dangerous persona.",
  },
  {
    id: "aesthetic_088",
    title: "Coastal Gothic Dark Academia Fog",
    prompt: "Generate an image embodying an enigmatic and ethereal coastal gothic or dark academia aesthetic — melancholic and mysterious atmosphere with a striking figure silhouetted against dense urban fog. The vibe is curated and artful with stark contrast between the subject's form-fitting dark outfit and the pervasive cool grey-white of thick fog that obscures towering skyscrapers into ghostly silhouettes. The mood is deeply atmospheric — dramatic beauty and enigmatic introspection suited for alternative fashion editorials or art photography portfolios.",
  },
  {
    id: "aesthetic_089",
    title: "Overcast Ethereal Atmospheric Mystery",
    prompt: "Generate an image embodying an introspective and profoundly atmospheric aesthetic — curated alternative fashion sensibility wrapped in pervasive ambient fog. The vibe is dreamlike with reality's edges blurred — muted colors and diffused light create an almost otherworldly quality that enhances enigmatic beauty. Suited for alternative fashion editorials mood-driven art photography series or personal blogs designed to evoke mysterious contemplative allure.",
  },
  {
    id: "aesthetic_090",
    title: "Soft Surrealism Vaporwave Diptych",
    prompt: "Generate an image combining a close-up portrait with an abstract ethereal scene — exuding a dreamy almost otherworldly soft surrealism or vaporwave aesthetic. The vibe blends personal intimate moments with abstract dreamlike vision — strong backlighting creates dramatic lens flares and halo effects around hair with blown-out highlights and gentle diffused glow. Contemplative nostalgic and subtly surreal — modern romanticism meets avant-garde social media artistry.",
  },
  {
    id: "aesthetic_091",
    title: "Early Internet Indie Bedroom Pop Lo-Fi",
    prompt: "Generate an image embodying an authentic awkward yet endearing early internet or indie bedroom pop aesthetic — raw candid self-expression from the era before sophisticated filters. The vibe is genuine unpretentious and intimately personal with slightly uncomfortable serious expressions — endearing awkwardness that feels honest and uncurated. Hand-drawn artwork or personal objects feature prominently. A hallmark of niche online communities where raw expression triumphs over mainstream polish — lo-fi aesthetics valued over perfection.",
  },
  {
    id: "aesthetic_092",
    title: "Soft Gothic Siren Core Cat Portrait",
    prompt: "Generate an image embodying an alluring and slightly melancholic soft gothic or siren core aesthetic — cradling a blurred cat with serene pensive expression. The vibe is enigmatic beauty and quiet intensity — luminous almost ethereal imagery with delicate highlights and dreamlike quality. Gentle intimate body language with alluring yet distant gaze — suited for fashion blogs mood-driven social media feeds or online portfolios evoking elegant allure and enigmatic charm.",
  },
  {
    id: "aesthetic_093",
    title: "Indie Sleaze Park Candid Photographer",
    prompt: "Generate an image embodying a playful authentic indie sleaze or early 2000s blog aesthetic — rebellious cool artistic detachment and spontaneous fun. The vibe is effortlessly stylish with unposed authenticity — subject holds a camera and cigarette in an everyday park setting. Earthy subdued palette with olive utility-style dress silver camera glint and subtle jewelry. Cool authentically rebellious embodying candid uncurated personal snapshot or street style photography with undeniable retro cool.",
  },
  {
    id: "aesthetic_094",
    title: "Dark Aesthetic Edgy Influencer Bold",
    prompt: "Generate an image embodying a bold provocative dark aesthetic or edgy influencer vibe — daring power and controlled rebellion. The vibe is intense and self-assured — assertive body language juxtaposing vulnerability with strength. Moody cinematic atmosphere with soft directional lighting creating gentle highlights. Suited for alternative fashion blogs mood-driven social media feeds or online portfolios evoking edgy allure and powerful self-expression.",
  },
  {
    id: "aesthetic_095",
    title: "Natural Ethereal Serene Minimalist",
    prompt: "Generate an image embodying a serene captivating natural ethereal aesthetic with a hint of quiet strength — clean minimalist beauty. The vibe is fresh luminous and harmoniously composed — warm creamy neutrals and pale tones with soft even lighting enhancing natural contours and delicate textures. A close-up portrait radiating serene approachable elegance.",
  },
  {
    id: "aesthetic_096",
    title: "Enigmatic Bloom Fine Art Ingenue",
    prompt: "Generate an image embodying an Enigmatic Bloom aura — a captivating blend of ethereal contemplation and quiet resilience rendered in hyper-real yet softly diffused pearlescent light. The vibe is calm intensity introspective beauty and timeless elegance — serene neutral expression with direct yet gently observing gaze reflecting thoughtfulness and understated ingenue quality. Whispering neutrals soft creams and muted earth tones create a harmonious timeless aesthetic — fine art portraiture or high-end minimalist editorial that feels both accessible and profoundly beautiful.",
  },
  {
    id: "aesthetic_097",
    title: "Summer Nostalgia Convertible Daydream",
    prompt: "Generate an image embodying an effortlessly chic and dreamy summer nostalgia or cinematic escape aesthetic — quiet luxury and freedom in a convertible. The vibe is serene aspirational and timeless — subject reclines casually gazing thoughtfully into the distance with wistful expression. Late afternoon golden glow illuminates creamy whites and beiges of dress and car interior against lush greens. Suited for luxury lifestyle magazines travel blogs or high-end social media campaigns evoking aspirational freedom beauty and nostalgic summer dreams.",
  },
  {
    id: "aesthetic_098",
    title: "Golden Hour Convertible Backlighting Reverie",
    prompt: "Generate an image embodying a nostalgic serene golden hour daydream aesthetic — cinematic warmth and romantic melancholy in the back seat of a convertible. The vibe is quiet introspection and youthful freedom — dramatic backlighting from setting sun with prominent lens flares and radiant glow around hair. Pensive expression with air of relaxed contemplation. Suited for lifestyle blogs travel journals or high-end social media feeds evoking wanderlust quiet beauty and cinematic introspection.",
  },
  {
    id: "aesthetic_099",
    title: "Alt-Glam Dark Siren Poolside",
    prompt: "Generate an image embodying a bold edgy and alluring alt-glam or dark siren aesthetic — mysterious allure and unapologetic self-possession poolside. The vibe is cool sophisticated and subtly rebellious — stark impactful palette of crisp white swimsuit deep brown hair and sunglasses cool blue pool water and rich red drink accent. Confident relaxed posture with intense unsmiling gaze. Suited for fashion-forward social media feeds alternative beauty blogs or online magazines projecting enigmatic glamorous and distinctly edgy persona.",
  },
  {
    id: "aesthetic_100",
    title: "Traditional Craftsmanship Museum Artifact",
    prompt: "Generate an image embodying an elegant traditional craftsmanship or historical artifact aesthetic — respectful appreciative museum-quality documentation. The vibe is refined and deeply aesthetic — objects displayed within wooden-framed glass case on clean white backdrop for detailed examination. A photographic approach emphasizing cultural significance over casual display. Suited for cultural heritage catalogs artisan portfolios or curated historical exhibits showcasing traditional beauty and meticulous artistry with objective clarity.",
  },
  {
    id: "aesthetic_101",
    title: "Unbothered Luxury Quiet Flex",
    prompt: "Generate an image embodying an audacious unbothered luxury or quiet flex aesthetic — a decadent curated wealth-porn aspirational lifestyle where the contrast between cozy elements like plush loungewear and soft bedding and the display of hard cash creates a surreal blend amplifying the unbothered opulence — conveying a blasé familiarity with extreme wealth and an ultimate state of relaxed indulgence as if caught unawares in a natural habitat of opulence — body language utterly unconcerned and deeply comfortable embodying the ultimate state of having arrived — elevating unbothered to an almost untouchable aspirational ideal — the intentionality of the display is key with a deliberate almost dismissive arrangement conveying both sheer quantity and casual indifference to monumental value — a powerful understated flex perfectly suited for high-end lifestyle social media and aspirational communities projecting ultimate financial freedom and an enviable unbothered existence.",
  },
  {
    id: "aesthetic_102",
    title: "Relaxed Defiant Main Character",
    prompt: "Generate an image embodying a relaxed almost defiant main character aesthetic — utterly relaxed posture with complete disregard for conventional public decorum — body language both vulnerable in its relaxation and powerful in its nonchalance embodying a singular main character presence — self-possession and bold personal expression where comfort meets confident disregard — conveying an ultimate state of comfort and a blend of ease with audacious individuality.",
  },
  {
    id: "aesthetic_103",
    title: "Indie Adventure Nostalgic Snapshot",
    prompt: "Generate an image embodying a quirky indie adventure or unexpected cowboy aesthetic — a nostalgic unpolished charm that feels authentic and unforced far from a professional photoshoot — not a polished equestrian but someone trying something new embracing a playful slightly theatrical moment — the overall feel is innocent adventure lighthearted awkwardness and genuine unpretentious fun embodying a candid personal snapshot style that resonates with a niche appreciation for authenticity over perfection — telling a story of an unexpected encounter or a charmingly unheroic journey — evoking quirky charm relatable amateurism and a genuine unpretentious moment of self-discovery.",
  },
  {
    id: "aesthetic_104",
    title: "Indie Rebel Subway Energy",
    prompt: "Generate an image embodying a playful rebellion artistic self-awareness and undeniable youthful swagger — a curated indie fashion editorial or street style aesthetic — cool energetic authentically rebellious with an infectious almost defiant energy — confident and engaging leaning into the shot — abstract streaks of light and shadow add to the sense of motion and urban dynamism — evoking rebellious spirit artistic vision and electrifying youthful energy suited for alternative fashion or youth culture.",
  },
  {
    id: "aesthetic_105",
    title: "Alt-Teen Angst Underground Rock",
    prompt: "Generate an image embodying a defiant alt-teen angst or underground rock aesthetic — raw unfiltered powerfully conveyed through a candid almost snapshot-like perspective — confrontational swagger with rock-on hand gestures and a sullen slightly aggressive pout and narrowed eyes conveying rebellious defiance and youthful disaffection — confident assertive body language embodying an I-don't-care-what-you-think attitude — authentically alternative non-conformist identity — edgy authentic and defiantly cool persona suited for alternative music communities or independent fashion.",
  },
  {
    id: "aesthetic_106",
    title: "Glam Casual Social Media Star",
    prompt: "Generate an image embodying a playful confident slightly provocative glam casual or social media star aesthetic — self-aware coquettish charm with mischievous confidence and clear awareness of being photographed for an audience — body language expressive and inviting meticulously curated for social media engagement — cheerful flirtatious aspirational embodying quintessential curated social media influencer or personal branding photography — engineered through specific photographic techniques to appear effortlessly perfect — presenting a version of reality optimized for digital consumption — projecting approachable glamour and confident playful self-expression.",
  },
  {
    id: "aesthetic_107",
    title: "Dark Angel Alt-Grunge Fairy",
    prompt: "Generate an image embodying a bold melancholic and subtly defiant dark angel or alt-grunge fairy aesthetic — raw unfiltered approach that strips away any artificial glamour — the overall mood is melancholic rebellious and subtly provocative embodying a candid raw indie or underground photography style — evoking poignant rebellion and unconventional beauty suited for an alternative fashion zine or art photography exploring urban subcultures.",
  },
  {
    id: "aesthetic_108",
    title: "Luxury Bags Humorous Self-Aware",
    prompt: "Generate an image embodying a humorous self-aware aspirational aesthetic — a candid social media post designed for engagement and relatability within a luxury-obsessed culture — posing with prominent luxury bags in a minimalist domestic context — the overall feel is humorous self-aware and aspirational showcasing a relatable yet aspirational persona with an unpretentious approach to displaying curated luxury.",
  },
  {
    id: "aesthetic_109",
    title: "Parisian Chic Playful Influencer",
    prompt: "Generate an image embodying a confident high-fashion Parisian chic meets playful influencer aesthetic — effortless style confidence and joyful self-expression — captured in a dynamic almost dance-like energy with engaging body language making the outfit the star — conveying an air of effortless style confidence and vibrant personality — chic playful and aspirational embodying a curated fashion blog or high-end lifestyle photography style suited for fashion influencer social media or style publications.",
  },
  {
    id: "aesthetic_110",
    title: "Selfie Ring Light Approachable Glamour",
    prompt: "Generate an image embodying a confident inviting aspirational selfie aesthetic — a personal social media selfie style designed for intimate connection and showcasing a luxurious lifestyle — relaxed and engaging body language typical of a direct-to-camera selfie — an organized luxurious display visible in the background providing aspirational context of success and curated taste — projecting approachable glamour and success fostering a sense of connection.",
  },
  {
    id: "aesthetic_111",
    title: "Serene Floral Ethereal Intimate",
    prompt: "Generate an image embodying a serene almost ethereal quality — calm and tranquil with a touch of romanticism — soft intimate pose with fingers gently touching lips and a subtle almost coy gaze — the subject surrounded by vibrant flowers in full bloom creating a lush natural backdrop — neutral background with minimal decoration allowing the focus to remain on subject and floral elements — the overall feel exudes gentle intimacy and natural beauty.",
  },
  {
    id: "aesthetic_112",
    title: "Moody Urban Mystery Dreamy",
    prompt: "Generate an image embodying a dreamy slightly out-of-focus quality that adds a sense of mystery and depth — neutral expression with a slight hint of a smile — elegant accessories like pearls and silver creating understated sophistication — blurred city street context suggesting urban life while maintaining intimate focus on the subject — the overall feel is moody atmospheric and elegantly mysterious.",
  },
  {
    id: "aesthetic_113",
    title: "Intimate Minimalist Sensual Reclining",
    prompt: "Generate an image embodying an intimate and sensual aesthetic — relaxed yet alluring reclining pose with hand raised to face creating vulnerability and mystery — plain muted gray or neutral wall providing minimalist somewhat moody atmosphere — emphasis on contours of the body and texture of sheets — the overall feel is intimate sensual and quietly provocative with a focus on the subject's relaxed pose.",
  },
  {
    id: "aesthetic_114",
    title: "Studious Tweed Mid-Century Casual",
    prompt: "Generate an image embodying a casual and intimate atmosphere with a mix of modern and rustic elements — a moment of personal reflection and self-expression — formal yet stylish attire in a tailored tweed suit with plaid pattern — intently focused on work or study — sleek mid-century modern interior with decorative sphere golden glow adding cozy ambiance — the photograph captures a calm organized and intellectually engaged presence.",
  },
  {
    id: "aesthetic_115",
    title: "Raw Editorial Flash Deliberate Dissonance",
    prompt: "Generate an image embodying deliberate dissonance — a formal archetype distorted into a rebellious almost predatory icon — formal business attire or studious dress staged in a pose more associated with album covers than professional settings — raw editorial anti-polished voyeuristic — a flash-lit shot that feels both accidental and impossibly styled — transforming traditional tailoring into something electric and aggressive — designed to unsettle and fascinate at the same time — pushing formal glamour to its provocative extreme.",
  },
  {
    id: "aesthetic_116",
    title: "Fashion Runway High-Fashion Spotlight",
    prompt: "Generate an image embodying high fashion and glamour — a fashion runway scene with attention to detail and styling emphasizing a sophisticated modern aesthetic — focused and contemplative expression adjusting clothing — sleek styling with pinstriped blazer crisp dress shirt and bold striped tie — the overall atmosphere is one of elevated fashion with impeccable presentation and confident poise.",
  },
  {
    id: "aesthetic_117",
    title: "Manga Doll Vulnerability Flash",
    prompt: "Generate an image embodying a manga doll vulnerability aesthetic — rich girl off her leash caught in emotional suspension — doll-like eyeliner with manga-level exaggeration and butterfly-jellyfish layered hair — synthetic shine meets baby-girl softness — performative vulnerability with watery innocence and deliberate chaos — she looks like she just finished crying or never started — you want to protect her but also question how much of this is performative — Tumblr 2011 intimate but unreadable screenshot energy — stillness charged with noise — dumb little bunny energy.",
  },
  {
    id: "aesthetic_118",
    title: "Seated Floor Subtle Submission Tender",
    prompt: "Generate an image embodying quiet real submission — not performative — aesthetic of emotional undressing not performance — passive trusting and just a bit too tender for the room — chosen stillness that feels like she's waiting for someone but not desperately — vulnerability through stillness and gentle body language — seated on the floor with back slightly curved forward head dipped in thought — hair resting softly against the side of her face obscuring part of her eye.",
  },
  {
    id: "aesthetic_119",
    title: "Rebellious Luxury Doll Bathroom Mirror",
    prompt: "Generate an image embodying a rebellious luxury doll aesthetic — someone styled in a bathroom mirror before sneaking out into the night — piecey floaty deliberately cut hair with layers that suggest ribbons of silk softly overlapping — vulnerable elegance with luxury without posing and femininity without sharpness — the feeling of seeing someone soft and private caught at 2 a.m. skin dewy eyes smudged — softness luxury and emotional openness — wind-swept but refined like soft expensive cashmere caught in a breeze.",
  },
  {
    id: "aesthetic_120",
    title: "Unbothered Rich Girl Street Old Money",
    prompt: "Generate an image embodying an unbothered rich girl aesthetic — late to class with a relaxed expensive unreadable expression — soft old money meets street practicality — not dressing to be seen but her aura commands attention — creamy textures and tonal palette speaking to quiet wealth — clean whites and warm neutrals — inspired by Toteme Filippa K or vintage Joseph — restrained confident effortless.",
  },
  {
    id: "aesthetic_121",
    title: "Morning Tea Kitchen Dreamed About",
    prompt: "Generate an image embodying a dreamy morning kitchen aesthetic — she makes tea like she's being dreamed about — barefoot in early morning light with a kettle and teacup — not performing but allowing with no pose only presence — hand gently cradling the teacup as if it was given not made — looking down brushing hair from her cheek steam rising like a veil — kitchen in soft chaos with toast crumbs and a spoon on the edge — the viewer is watching through something private — soft submission energy with shoulders dropped inward and quiet vulnerability.",
  },
  {
    id: "aesthetic_122",
    title: "Soft Morning Routine Couture",
    prompt: "Generate an image embodying wealth restraint and rare femininity that doesn't beg for attention but assumes it — soft structure where every bend is intentional — inspired by Valentino fittings Dior backstage or Carolyn Bessette-Kennedy — caught mid-movement brushing a ringed finger across her cheek gazing downward in a trance of her own making — the room softly blurred you don't need to see the marble to know it's there — warm haze emotionally still intimate — the viewer feels like they've just woken up next to her.",
  },
];

export const Lighting = [
  {
    id: "lighting_001",
    title: "Golden Hour",
    prompt: "Golden Hour Ethereal Radiance: Utilize soft warm directional natural light specifically simulating golden hour late afternoon or early morning sun filtered through tree foliage or architectural elements. Light falls gently across subject creating warm soft glow that imparts ethereal radiance to skin and hair. This specific quality of light with elongated shadows and warm hue is exquisitely rendered by camera sensor imbuing entire scene with romantic almost magical quality. Creates luminous highlights on cheekbones forehead and subtle sheen of hair with highlights appearing softly radiant not harsh or blown out",
  },
  {
    id: "lighting_002",
    title: "Unblemished Serenity",
    prompt: "This flat but flattering light is carefully controlled by camera to reduce imperfections while creating unblemished serenity across subject face. Even diffused illumination minimizes dramatic shadows creating sense of calm making features appear smoother and more angelic without losing essential character. Subtle catchlights introduced - delicate yet distinct sparkles in eyes indicating precise light direction",
  },
  {
    id: "lighting_003",
    title: "Theatrical Contrast Hard Light",
    prompt: "Dramatic Directional Hard Light with Controlled Contrast: Light source is single focused and deliberate perhaps strong window light from one side studio strobe or late afternoon sun creating distinct beam. This creates high-contrast scene with sharp shadows and bright highlights far more pronounced than natural perception drawing intense attention to interplay of light and shadow. Sharp-edged shadows cast deep graphic shapes across surfaces accentuating contours of body and architectural elements creating almost theatrical contrast",
  },
  {
    id: "lighting_004",
    title: "Coastal Hazy Dreamy",
    prompt: "Bright Hazy Midday Coastal Light: Direct overhead summer sun filtered through coastal humidity creating soft diffused quality with gentle shadows - slight overexposure washing out sky to nearly white while maintaining detail in subject - reflected light bouncing from sand or water acting as natural fill creating luminous even illumination that's flattering and dreamy",
  },
  {
    id: "lighting_005",
    title: "Atmospheric Haze Magical Realism",
    prompt: "Controlled Studio Atmospheric Lighting: Sophisticated multi-source setup with softboxes and strobes creating dramatic yet soft illumination - backlighting for luminous effects and subtle spot lighting on focal points - smoke machine or atmospheric haze for misty ethereal quality - precise control over highlights and shadows - ideal for miniature diorama aesthetic or enchanted scenes requiring magical realism",
  },
  {
    id: "lighting_006",
    title: "Highlight Bloom Soft-Focus",
    prompt: "Soft Diffused Natural Window Light with Highlight Bloom: Utilize soft diffused natural light from window possibly complemented by subtle warm fill light simulating overcast day or early morning light. Light incredibly soft and even gently bathing subject in luminous glow creating minimal gentle shadows that subtly sculpt features without harshness. Very subtle highlight bloom or glow around brightest areas particularly where light catches hair or skin adding to dreamlike soft-focus quality making image feel more ethereal and less harshly real. Light inherently carries warm gentle tone contributing to intimate and comforting setting.",
  },
  {
    id: "lighting_007",
    title: "Three-Dimensional Sculpted",
    prompt: "Soft Diffused Natural Light with Three-Dimensional Fall-Off: Utilize soft diffused natural light mimicking open shade on bright day or gentle overcast lighting. Light sculpts features with exquisite gradual light fall-off creating profound sense of three-dimensionality and form making face appear almost sculpted. Gentle yet distinct specular highlights on eyes tip of nose and subtle sheen of hair with soft natural pop reflecting light with subtle healthy glow conveying youthfulness and vitality. Deep rich yet open shadows that retain significant color and textural information particularly in hair and folds of dress without being crushed to pure black.",
  },
  {
    id: "lighting_008",
    title: "Dappled Foliage Interplay",
    prompt: "Dappled Sunlight Through Foliage: Dappled sunlight filtering through leaves casting gentle shadows - natural light creating soft diffused quality with beautiful interplay of light and shadow through tree canopy",
  },
  {
    id: "lighting_009",
    title: "Chandelier",
    prompt: "Soft Chandelier Light: Polished floors reflecting soft light from chandeliers creating timeless elegance - warm ambient interior lighting with gentle reflections adding depth and sophistication",
  },
  {
    id: "lighting_010",
    title: "Serene Complexity Diffused",
    prompt: "Soft Natural Diffused Daylight: Soft natural diffused daylight creating even illumination and serene complexity - natural light providing soft even illumination that reveals subtle textures and colors without harsh shadows",
  },
  {
    id: "lighting_011",
    title: "Harsh On-Camera Flash Override",
    prompt: "The light is primarily from the harsh direct on-camera flash overriding any natural ambient light. Apply a cool-leaning slightly desaturated color grade with a distinct digital film simulation feel of early point-and-shoot cameras.",
  },
  {
    id: "lighting_012",
    title: "Specular Highlights Gleam Luxury",
    prompt: "Specular highlights gleam of luxury - introduce crisp yet controlled specular highlights on her hair the faux fur of her earmuffs the slight sheen of her turtleneck and the reflective surfaces of any subtle jewelry - these highlights should have a photographic pop and zing reflecting light with a subtle shimmering quality that conveys a sense of high-end materials and the pristine environment.",
  },
  {
    id: "lighting_013",
    title: "Soft Diffused Ambient Enveloping Glow",
    prompt: "Utilize soft diffused ambient lighting likely from a nearby window or a large softbox creating a gentle enveloping glow. Flat even illumination unblemished serenity - the light should be soft and exceptionally even across her face minimizing harsh shadows and creating a sense of unblemished serenity - this flat but flattering light is carefully controlled to reduce imperfections making her features appear smoother and more angelic. Subtle catchlights and specular highlights spark of life - introduce delicate yet distinct catchlights in her eyes that sparkle with a photographic pop indicating precise light direction - subtle specular highlights should also be visible on her glossy hair and the cat's fur catching the light with a soft sheen that communicates texture and life often more noticeable in a high-quality capture than in real life. Luminous hair and fur tactile softness - the light should illuminate her long dark hair and the cat's fur creating a luminous sheen that highlights individual strands and hairs making them appear incredibly soft and tactile - this detailed rendering of texture is a testament to the camera's sensor resolution and light gathering capabilities.",
  },
  {
    id: "lighting_014",
    title: "Colorful Backlit Rim Hyperreal Pop",
    prompt: "Utilize dynamic mixed lighting combining vibrant colorful environmental illumination with subtle ambient overhead lighting. Hyperreal pop rim lighting - the primary light source should emanate from bright colorful environmental lights casting a vibrant multi-hued glow onto the subject from behind and to the side - this creates dramatic rim lighting and colorful spill onto clothing and hair an effect that is significantly amplified and stylized by the camera's sensor and post-processing making the colors feel more electric and saturated than they would appear to the naked eye. Soft frontal fill flattering illumination - a softer more diffused frontal fill light likely ambient overhead should gently illuminate her face ensuring it remains well-exposed and flattering creating subtle highlights that sculpt her features without harshness - the camera's dynamic range ensures bright and dark areas are rendered with detail preventing blown-out highlights or crushed shadows. Specular highlights playful sheen - introduce controlled specular highlights on her hair reflective surfaces and any subtle jewelry - these highlights should have a crisp yet not overpowering photographic sparkle adding a playful sheen that enhances the overall vibrancy and perceived quality of the scene.",
  },
  {
    id: "lighting_015",
    title: "Sculpted Directional Regal Opulence",
    prompt: "Utilize soft directional ambient lighting mimicking elegant diffused event lighting or a large soft studio light. Sculpted light fall-off regal form - the light should sculpt her features and the contours of her attire with exquisite gradual light fall-off creating a profound sense of three-dimensionality and form that makes her appear almost statuesque - this subtle transition from light to shadow is far more nuanced than what the eye typically registers drawing attention to her composed expression and the graceful lines of her pose amplifying her regal presence and the luxurious texture of her clothing. Specular highlights shimmering opulence - introduce controlled yet dazzling specular highlights on jewelry accessories and polished surfaces nearby - these highlights should have a photographic sparkle and gleam reflecting light with a subtle shimmering quality that conveys exquisite craftsmanship and high-end materials a visual cue of luxury significantly enhanced by the camera's ability to capture intense light points. Deep yet open shadows dramatic elegance - ensure deep rich yet open shadows that retain significant color and textural information particularly in the folds of clothing and the darker areas of the environment - this high dynamic range rendering is a hallmark of professional sensors allowing the darker areas of the image to still reveal subtle details contributing to a dramatic yet refined elegance.",
  },
  {
    id: "lighting_016",
    title: "Bright Soft Mountain Daylight",
    prompt: "Bright yet soft natural daylight characteristic of a clear mountain morning with indirect fill light — luminous frontal lighting from a bright slightly overcast sky or reflected light falls beautifully across the face and body creating flattering luminous highlights that sculpt features with gentle three-dimensionality making the subject appear radiant and glowing with natural beauty — wide dynamic range ensures bright highlights on skin and snow-capped peaks are rendered without being blown out preserving detail and preventing harshness — delicate sparkling catchlights in the eyes draw the viewer into an engaging friendly gaze — balanced exposure across the entire scene from bright snow-capped mountains to shadows in the green valley and skin tones creating a harmonious image where no element is lost",
  },
  {
    id: "lighting_017",
    title: "Cathedral Floodlight Dramatic Night",
    prompt: "Dramatic artificial illumination from cathedral floodlights and ambient city glow captured with enhanced photographic sensitivity — the architecture powerfully illuminated by warm upward-facing floodlights creating stark contrasts between glowing stone and deep shadows within Gothic recesses — this dramatic lighting exaggerates architectural details and textures making them pop with almost theatrical intensity not seen as vividly in real life — wet pavement in the foreground acts as a mirror-like surface reflecting the cathedral light and sparse city lights with a shimmering ethereal quality creating luminous streaks and pools that add to the mysterious atmosphere — the night sky rendered as inky profound black provides stark dramatic contrast to the illuminated architecture — true blacks without crushing shadow detail in the foreground creating a sense of infinite darkness around the glowing monument",
  },
  {
    id: "lighting_018",
    title: "Angelic Softbox Ethereal Glow",
    prompt: "Soft diffused and highly controlled studio lighting mimicking a large softbox or parabolic reflector placed slightly off-axis. Light is luminous and exceptionally even across subject's face creating a subtle almost internal glow that softens features and eliminates harsh shadows — this gentle enveloping illumination contributes heavily to an ethereal and innocent quality making subject appear almost angelic. Despite the evenness there should be subtle light fall-off that gently sculpts facial features creating a delicate sense of three-dimensionality without any harshness — this precise control of light and shadow is a hallmark of high-end studio photography allowing for a refined portrayal of form that enhances the subject's delicate presence. Soft yet distinct catchlights in the eyes giving them a lifelike sparkle that draws the viewer in and adds an element of sentience to the gaze even in such a stylized scene.",
  },
  {
    id: "lighting_019",
    title: "Soft Indoor Ambient Specular Warmth",
    prompt: "Soft diffused ambient lighting mimicking a well-lit modern home interior with indirect light sources or natural window light filtering into a bedroom complemented by subtle warm fill. Light falls gently and evenly across subjects with gentle light fall-off creating flattering highlights that sculpt features with delicate three-dimensionality — nuanced transitions from light to shadow far more refined than what the eye typically registers intensifying a serene and slightly melancholic mood. This gentle illumination makes skin appear luminous and healthy and fur soft and inviting contributing to overall radiant warmth. Dynamic range ensures highlights are rendered without being blown out preserving detail and preventing a harsh look. Controlled soft specular highlights on jewelry earrings reflective surfaces and eyes should have a gentle yet distinct photographic sparkle — subtly communicating understated elegance. Open well-balanced shadows provide depth and form without becoming overly dark or crushed — the ability to retain detail and subtle color information in mid-tones and darker areas adds richness to fabrics textured surfaces and the overall cozy atmosphere. Soft diffused luminous highlights on cheekbones and the sheen of fur possess a gentle almost glowing quality indicating high dynamic range capture without harshness.",
  },
  {
    id: "lighting_020",
    title: "Even Diffused Workspace Luminous Clean",
    prompt: "Even directional yet diffused ambient illumination mimicking bright indirect daylight from a large window or professional workspace lighting — gently illuminating face and workspace without harsh shadows or blown-out highlights. This creates a clean bright atmosphere that visually communicates calm efficiency and clarity of thought — a brightness that feels more consistently flattering than real-life conditions. Soft enveloping light wraps around the subject creating luminous highlights on skin and work surfaces with open transparent shadows that define form without harshness — the flattering clean light reveals texture in the weave of clothing and the grain of whiteboard surfaces with clarity not harshness. Subtle cool reflection from laptop or monitor screens casts onto face and hands indicating digital engagement. Controlled specular highlights on laptop bezels whiteboard frames and polished surfaces communicate cleanliness and modernity — a subtle photographic sheen more pronounced and flattering than incidental office lighting. Preserved shadow detail in fabric folds and arm creases with no blown highlights despite bright background surfaces.",
  },
  {
    id: "lighting_021",
    title: "Even Ambient Computational Indoor",
    prompt: "Soft diffused ambient lighting combining indirect natural light from a window with standard indoor room lighting. Even illumination across the scene characteristic of smartphone computational photography — eliminating harsh shadows and bright spots. This accessible authenticity makes the subject approachable and her situation feel universal rather than dramatic. Subtle cool reflection from laptop screen on face and hands indicating digital engagement. Balanced dynamic range through HDR processing ensuring neither bright wall nor darker clothes are overexposed or crushed — tonally balanced realism that feels authentically captured yet slightly more polished than the human eye would perceive.",
  },
  {
    id: "lighting_022",
    title: "Soft Luminous Overcast European Alley",
    prompt: "Soft diffused ambient lighting mimicking gentle even illumination of an overcast day in a narrow European alley or large diffused studio light. Luminous even illumination gently wrapping around form and textures of stone wall — conveying timeless serenity and enhancing pristine quality. Gentle distinct specular highlights on hair subtle sheen of linen clothing and gilded mosaic elements — soft delicate glow indicating high dynamic range capture. Rich yet open shadows within crevices of stone wall and beneath objects retaining significant color and textural information — ancient environment feeling deeply textured and full of hidden stories.",
  },
  {
    id: "lighting_023",
    title: "Overcast Natural Three-Dimensional Sculpt",
    prompt: "Soft diffused natural light mimicking an overcast day or gentle shade under a tree with subtle hints of directional light filtering through. Three-dimensional light fall-off sculpting profile with exquisite gradual transitions — drawing attention to delicate lines of neck and jaw and quiet dignity of expression. Gentle distinct specular highlights on skin cheekbone bridge of nose on waxy leaves and delicate petals — photographic gleam and soft sparkle reflecting light with subtle living quality conveying depth and freshness. Deep yet open shadows in foliage retaining significant color and textural information without being crushed to pure black — high dynamic range revealing subtle details in darker areas.",
  },
  {
    id: "lighting_024",
    title: "Dappled Natural Hammock Ambient",
    prompt: "Soft dappled natural light filtering through a leafy canopy. Beautifully handled dynamic range characteristic of film — bright highlights on hair and hammock retaining detail and soft glow while shadows under chin and in foliage remain rich deep and open preserving subtle color and texture. Luminosity in highlights feeling more radiant and dreamlike than direct observation. Gentle natural specular highlights on skin and hammock fibers — subtle organic sheen reflecting light naturally yet elevated. Ambient light softly wrapping around subject sculpting features with gentle three-dimensionality and smooth transitions from light to shadow.",
  },
  {
    id: "lighting_025",
    title: "Dappled Canopy God Rays Enchanted",
    prompt: "Soft diffused natural light filtering through a canopy of leaves creating dappled light effect or overcast muted daylight. Soft luminous glow on pale skin and creamy white fabric making the subject appear almost radiant against darker bark — delicate luminosity giving an otherworldly almost angelic presence. Soft ethereal god rays or gentle atmospheric haze filtering through trees in the background adding magical atmosphere and depth. Rich yet soft shadows within tree bark and deeper foliage — transparent retaining significant detail and subtle color variations adding mysterious depth without creating harshness.",
  },
  {
    id: "lighting_026",
    title: "Dappled Sun Film Bloom Natural",
    prompt: "Natural dappled sunlight filtering through leaves creating a play of light and shadow that feels organic yet artistically controlled. Soft luminous highlights on skin and hair with distinctive filmic bloom or glow — brightest areas gently bleeding into surrounding tones characteristic of film emulsion. Rich open shadows in grass and foliage — deep yet retaining rich color information verdant greens earthy browns without being crushed to pure black. Delicate organic lens flares or light leaks subtly present adding dreamy nostalgic atmosphere. High dynamic range of film allowing smooth transition from bright sunlight to deep shadow.",
  },
  {
    id: "lighting_027",
    title: "Soft Ambient Overcast Romantic Melancholy",
    prompt: "Soft diffused ambient natural light characteristic of an overcast day or the golden hour just before sunset. All-encompassing softness and gentle glow illuminating without harsh shadows or strong contrasts — making skin appear luminous and delicate enhancing ethereal aura. Gentle almost imperceptible highlights on hair and tops of tall grasses — delicate glints of light adding sparkle that feels organic and natural. Rich yet transparent shadows retaining significant color and textural information — particularly in darker greens and depths of dress folds — avoiding flat blackness conveying depth and mystery.",
  },
  {
    id: "lighting_028",
    title: "Dramatic Spot Runway Film Fall-off",
    prompt: "Dramatic theatrical spotlighting typical of a fashion runway rendered with nuanced film characteristics. Focused spotlight from above and front creating strong contrast against dark background — shadows exhibiting soft gradual fall-off characteristic of film's excellent dynamic range preventing harsh clipping. Subtle artistic lens flare or glow in areas of high contrast — adding dreamlike slightly imperfect analog charm. Deep atmospheric shadows creating a void that emphasizes the subject as the sole luminous figure — film's nuanced dark tone rendering maintaining subtle detail even in low light.",
  },
  {
    id: "lighting_029",
    title: "Harsh Directional Blue Cast Noir",
    prompt: "Harsh yet artistically controlled directional artificial light from a single undiffused source — bare bulb or small strobe combined with ambient room light. Hard direct light creating sharp defined shadows that dramatically sculpt face and body — cinematic film noir contrast exaggerating contours and deepening introspection. Strong intentional blue color cast dominating the background and subtly washing over the subject in shadows — deliberate artistic choice infusing ethereal cold almost ghostly atmosphere. Highlights with controlled fall-off — skin retaining delicate glow with rapid dramatic fall-off into deep shadows emphasizing fragility and tension.",
  },
  {
    id: "lighting_030",
    title: "Golden Hour Backlight Car Interior",
    prompt: "Rich warm Golden Hour natural light — specifically backlighting and rim lighting complemented by ambient light within the car interior. Strong warm sunlight from behind and to the side creating pronounced luminous golden rim light around hair and shoulders — hair appearing to glow with ethereal quality. Gentle frontal illumination from ambient light or subtle fill preventing silhouette while keeping features soft and visible. Intense overall warmth with subtle increased saturation in golden tones creating comfort happiness and cherished memory. Camera's dynamic range preserving detail in both bright backlighting and gentle shadows.",
  },
  {
    id: "lighting_031",
    title: "Strong Directional Boat Cabin Dramatic",
    prompt: "Strong directional natural light streaming from an unseen window or hatch creating dramatic contrasts. Pronounced highlights on skin book pages and metallic watch with slightly blown-out quality on brightest parts — intense sunlight creating visceral sense of bright escape within cozy darker cabin. Deep rich yet discernible shadows in background and unlit side of body — retaining just enough detail for depth and atmospheric immersion without being completely crushed. Sharp almost glinting specular highlights on metallic surfaces — bright points of interest grounding the image in tangible reality.",
  },
  {
    id: "lighting_032",
    title: "Harsh Overhead Fluorescent Urban",
    prompt: "Harsh direct localized light mimicking overhead fluorescent tube or strong undiffused source within a confined utilitarian space — subway car back alley stark interior. Dramatic high-contrast shadows and highlights sculpting features with almost stark realism — light falling steeply from above carving cheekbones and jawline deepening shadows under brow and chin. Sharp pinpoint specular highlights in eyes and on damp or textured surfaces — intense highlights captured with precision by high-dynamic-range sensor. Deep yet highly textured shadows within hood and under chin retaining subtle nuances of fabric texture and skin tone — revealing hidden complexities and depths.",
  },
  {
    id: "lighting_033",
    title: "Controlled Studio Softbox Portrait",
    prompt: "Controlled dramatic studio lighting — single large softbox or parabolic modifier positioned slightly off-axis and above with secondary fill light preventing harsh shadows. Soft yet clearly defined directional shadows sculpting facial features and hoodie folds with precise three-dimensionality — far more controlled and expressive than typical observation. Controlled specular highlights on watch subtle hair sheen and hoodie texture — photographic pop and zing reflecting texture and material quality. Deep rich yet open shadows beneath jawline and within hoodie folds retaining significant textural and color information.",
  },
  {
    id: "lighting_034",
    title: "Harsh Direct Selfie Overhead Artificial",
    prompt: "Harsh direct slightly overhead artificial lighting typical of indoor environments — bathroom vanity lights or harsh overhead room lighting. Pronounced defined shadows sculpting cheekbones and jawline with sultry dramatic intensity. Strong slightly blown-out specular highlights on forehead nose and lips creating glossy almost ethereal sheen that feels both accidental and alluring. Subtle glow effect around brighter areas — visual artifact of phone photography under harsh light adding captivating luminous allure.",
  },
  {
    id: "lighting_035",
    title: "Soft Overcast Historical Portrait",
    prompt: "Soft diffused natural light mimicking gentle ambient illumination of an overcast day or shaded portico reminiscent of historical paintings. Gentle sculpting of profile and delicate ruffles creating soft gradual transitions from light to shadow — defining form with classical elegance. Exquisitely delicate specular highlights on pearl earrings ornate hair barrette and slight skin sheen — soft pearlescent glow speaking to refinement and historical charm. Rich yet open shadows retaining significant detail in dress folds and background architecture — preventing harsh modern contrast and maintaining period feel.",
  },
  {
    id: "lighting_036",
    title: "Soft Directional Studio 90s Editorial",
    prompt: "Soft directional studio lighting mimicking a large softbox or beauty dish placed slightly off-axis. Key light sculpting features with gentle yet defined highlights along cheekbones and forehead — creating refined three-dimensionality that makes skin appear luminous and soft. Subtle fill light ensuring shadows are deep but open retaining detail in darker areas of hair and textured surfaces — film latitude preventing harsh contrasts. Soft natural-looking catchlights in eyes adding spark of life and engagement.",
  },
  {
    id: "lighting_037",
    title: "Golden Backlight Rim Halo Winter",
    prompt: "Strong dramatic backlighting from a low winter sun complemented by ambient glow of steam. Intense golden backlight creating beautiful rim light around head and steam edges — sculpting forms with luminous glow that feels almost angelic. Subtle sunburst effect around the sun adding vibrant energy communicating crispness of winter day. Reflective water surface exhibiting beautiful shimmering light interactions — tranquil and inviting. Despite harsh backlight foreground retains detail through computational dynamic range — no silhouetting.",
  },
  {
    id: "lighting_038",
    title: "Golden Hour Backlight Pastoral Halo",
    prompt: "Soft warm golden hour natural light primarily coming from behind the subject creating a luminous halo effect around hair and fur — exaggerated rim light lending ethereal almost angelic quality. Gentle lens flare haze adding subtle soft glow across portions of the image enhancing dreamlike nostalgic feel. Exquisite gradual light fall-off sculpting form with profound three-dimensionality and graceful contour. Rich yet open shadows retaining significant color and textural information without being crushed to pure black. Film's dynamic range ensuring delicate highlights are rendered without being blown out.",
  },
  {
    id: "lighting_039",
    title: "Intense Midday Beach Editorial",
    prompt: "Harsh direct midday sun expertly handled to create dramatic contrast and untamed energy. Brilliant almost blown-out highlights on sea foam and white dress with retained detail in skin mid-tones and darker sky — extreme contrast creating dramatic tension mirroring emotional intensity. Sharp sparkling catchlights in eyes and bright glints off wind-blown hair conveying movement and life. Subtle shadow details on body and in deeper wave parts retaining color information preventing complete crush — high dynamic range grounding the dramatic scene. Fine grain-like texture adding gritty film-like authenticity.",
  },
  {
    id: "lighting_040",
    title: "Mountain Atmospheric Clarity Natural",
    prompt: "Soft natural enveloping light characteristic of a bright overcast mountain environment. Atmospheric clarity of mountain air allowing distant details to remain sharp yet subtly softened by sheer expanse creating boundless space and majestic scale. Water surface creating subtle shimmering reflections adding dynamic element to serene landscape. Gentle high-key illumination without harsh shadows — light evenly distributed across subject and vast landscape.",
  },
  {
    id: "lighting_041",
    title: "Bright High-Key Diffused Summer Sky",
    prompt: "Bright natural high-key ambient lighting from wide-open outdoor space on slightly overcast or hazy sunny day. Soft highly diffused illumination enveloping subject in gentle even glow — minimal harsh shadows and delicate highlights making skin appear luminous and smooth. Subtle atmospheric haze especially toward horizon softening cloud edges and blending sky seamlessly — amplifying dreamlike ethereal quality. Natural backlight creating delicate halo effect around hair — glowing against bright sky contributing to angelic aura.",
  },
  {
    id: "lighting_042",
    title: "Bright Dappled Backlit Summer Meadow",
    prompt: "Bright natural midday or late afternoon sunlight positioned to create both direct illumination and subtle backlighting effects. Radiant frontal light illuminating face and hair with luminous highlights and sun-kissed youthful vitality. Subtle rim lighting where light catches edges of hair or shoulders — ethereal separation adding depth. Vibrant shadow detail with clean yet vibrant shadows retaining excellent color and textural information — preventing crush in dark fabrics. High dynamic range handling bright highlights without blowing them out.",
  },
  {
    id: "lighting_043",
    title: "Dappled Golden Hour Portra Forest",
    prompt: "Soft dappled natural light filtering through trees creating painterly play of light and shadow. Soft golden-hour warmth gently falling across subject making skin luminous and hair subtly highlighted — characteristic of Portra film's response to natural light. Gentle gradual light fall-off sculpting form with profound three-dimensionality — subtle transitions more nuanced than what the eye typically registers. Deep rich yet open shadows retaining significant color and textural information in foliage — organic richness and natural depth. Film's dynamic range ensuring delicate highlights are rendered without being blown out.",
  },
  {
    id: "lighting_044",
    title: "Sun-Drenched Idyllic Golden Glow",
    prompt: "Strong direct morning or late afternoon sunlight transformed by advanced sensor dynamic range into flattering ethereal glow. Softened diffused highlights on skin and white cushions preventing harsh overexposure — open shadows retaining significant detail and warmth avoiding crushed blacks. Overall golden-hour warmth imbuing the scene with nostalgic dreamlike glow — sun's touch feeling gentle and inviting rather than harsh. Very subtle controlled warm lens flare or atmospheric haze in brightest areas adding to dreamlike ethereal quality.",
  },
  {
    id: "lighting_045",
    title: "Intense Golden Hour Dappled Shadow Play",
    prompt: "Intense direct golden-hour sunlight filtered and sculpted by the camera's interaction with the scene. Distinct yet softened shadows of foliage cast across face and body — dappled effect aesthetically enhanced by dynamic range preserving detail in both bright highlights and deeper shadows. Gently blown-out highlights on skin and flowers — controlled soft clipping creating ethereal luminous glow rather than harsh overexposure. The interplay of shadow and golden light creates an artistic painterly texture across the subject.",
  },
  {
    id: "lighting_046",
    title: "Soft Diffused Meadow Folkloric Light",
    prompt: "Soft diffused natural daylight mimicking an overcast day or golden hour filtering through foliage. Soft even illumination gently on face and hair without harsh shadows — creating luminous almost angelic glow. Subtle organic light flares or soft haze around brighter areas — whispers of magic from lens artifacts adding dreamlike slightly imperfect beauty. Dynamic range handling bright whites of flowers and lush greens with beautiful subtlety — vibrant freshness rendered with soft gentle quality.",
  },
  {
    id: "lighting_047",
    title: "Dappled Canopy Summer Escape Backlit",
    prompt: "Bright natural daylight filtering through dense tree canopy creating dappled light on the path. Strong sun-drenched highlights on path and subject's back contrasted with deep yet detailed shadows from trees — dramatic contrast making the scene feel energetic and alive. Visible atmospheric haze or glow where light breaks through foliage — adding enchantment and depth making the forest feel mystical and inviting. Consumer film dynamic range allowing dramatic contrast between highlights and shadows.",
  },
  {
    id: "lighting_048",
    title: "Dappled Sun Garden Halation Reverie",
    prompt: "Soft dappled natural light characteristic of late afternoon in a garden with sunlight filtering through leaves. Film glow highlights — soft luminous highlights on wet hair and skin exhibiting subtle halation effect with gentle blooming of light softening edges and lending ethereal almost dreamlike quality. Gentle sculpting of face and shoulders revealing delicate features with subtle curves — wide dynamic range of Portra film ensuring smooth light transitions preserving detail in brightest highlights and softest shadows. Sun-dappled bokeh in background creating distinct soft-edged circles of light contributing to magical ethereal garden atmosphere.",
  },
  {
    id: "lighting_049",
    title: "Intense Snow-Reflected High-Key Kawaii",
    prompt: "Bright direct sunlight reflecting intensely off pristine snow. Intense almost blown-out highlights embraced by the camera processing contributing to overwhelming bright joyous energy. Minimal shadows and high-key lighting creating unadulterated optimistic feel stripping away gloom — pure unbridled happiness. Slight playful lens flare or chromatic aberration visible around high-contrast edges — charming imperfection adding to candid unpretentious aesthetic.",
  },
  {
    id: "lighting_050",
    title: "Harsh Winter Sun Dramatic Contrast",
    prompt: "Harsh direct sunlight potentially mixed with bright overcast clouds creating dramatic interplay of light and shadow characteristic of brisk winter day. Strong yet defined contrast making bright snow and clouds pop against darker elements. Dynamic range handling contrast effectively — bright areas vibrant without completely blown out and shadows retaining detail contributing to vivid energy. Intense specular highlights on fresh snow making it sparkle and gleam with dazzling brightness. Dramatic sky with fast-moving clouds against patches of clear blue creating sense of natural majesty.",
  },
  {
    id: "lighting_051",
    title: "Radiant Frontal Kawaii Ethereal Glow",
    prompt: "Bright direct frontal sunlight intentionally over-exposed by camera processing to create radiant almost blinding brightness on snow and figures. Frontal lighting minimizes harsh shadows on face contributing to open cheerful expression and overall sense of purity. Individual snow flakes rendered with heightened almost glittery sparkle catching light creating dynamic magical effect more vivid and enchanting than real snow. Gentle diffused lens flare present around edges of very bright areas adding to dreamlike ethereal atmosphere reinforcing sense of intense light.",
  },
  {
    id: "lighting_052",
    title: "Soft Diffused Portra Film Daylight",
    prompt: "Bright expansive natural daylight ideally slightly overcast yet luminous sky or early afternoon sun captured with film's unique light sensitivity. Soft diffuse highlights on blonde hair and white fabrics making them glow with dreamy radiance — film dynamic range gently rolling off highlights preserving detail preventing harsh blown-out look. Rich yet open shadows retaining significant color and textural information — hallmark of Portra film adding depth and realism without obscuring details. Pervasive sun-kissed glow particularly on golden wildflowers subtly amplified by film color response creating palpable warmth and joy.",
  },
  {
    id: "lighting_053",
    title: "High-Altitude Mountain Diffused Film Light",
    prompt: "Bright natural high-altitude daylight characteristic of clear mountain day. Bright and expansive with subtle diffusion from atmospheric haze at altitude creating soft even illumination across vast landscape. Film emulsion captures this light with unique color response rendering blues and greens with particular vibrancy and depth feeling more saturated and immersive than direct observation. Gentle uncontrolled lens flare or light leak adding raw spontaneous imperfect charm of film photography. Film exposure latitude allowing well-balanced highlights and shadows across entire scene from bright sky to shaded valleys.",
  },
  {
    id: "lighting_054",
    title: "Dramatic Directional Fashion Sculpting",
    prompt: "Soft directional key lighting from large parabolic softbox or beauty dish positioned slightly to front-side complemented by subtle fill. Exquisite gradual light fall-off sculpting face creating profound three-dimensionality and form highlighting bone structure and curve of neck — far more controlled and nuanced than typical eye perception. Crisp yet not overpowering specular highlights on skin polished metal of jewelry and subtle sheen of hair — photographic ping and luster reflecting light with subtle luxurious glow. Deep yet open shadows on unlit side retaining significant color and textural information — high dynamic range hallmark of professional sensors.",
  },
  {
    id: "lighting_055",
    title: "Clamshell Beauty Radiant Studio",
    prompt: "Soft expansive studio lighting mimicking large parabolic softbox or beauty dish positioned slightly off-axis. Primary light sculpts face with gentle yet defined highlights along cheekbones and forehead complemented by subtle fill light from below — clamshell technique lifting shadows under eyes and chin creating radiant even illumination defining bone structure without harshness. Distinct yet soft catchlights in eyes giving sparkle making gaze incredibly engaging and alive. Subtle hair light from behind gently separating hair from background creating soft halo effect adding dimension and ethereal glow making hair appear exceptionally lustrous and voluminous.",
  },
  {
    id: "lighting_056",
    title: "Overcast Forest Canopy Filmic Ambient",
    prompt: "Soft diffused ambient lighting simulating overcast sky or deep forest canopy light avoiding harsh direct sunlight. Three-dimensional light fall-off sculpting features and surrounding natural elements with exquisite gradual transitions creating profound sense of organic form — more nuanced than typical eye perception drawing attention to contemplative expression and delicate hair and skin textures. Gentle yet distinct specular highlights on skin around eyes and lips in wet hair and on damp reflective natural surfaces — soft diffused photographic sheen conveying vitality and freshness. Deep rich yet open shadows retaining significant color and textural information without crushing to pure black.",
  },
  {
    id: "lighting_057",
    title: "Soft Diffused Window Ambient Interior",
    prompt: "Soft diffused ambient lighting mimicking overcast day filtering through large window complemented by subtle interior light. Even soft illumination across scene avoiding harsh shadows and bright highlights creating uniform gentle illumination feeling protective and intimate enhancing introspective mood. Camera light metering set for film subtly flattens contrast contributing to dreamlike softness. Gentle light fall-off into deeper background creating sense of depth within overall softness preventing flat appearance.",
  },
  {
    id: "lighting_058",
    title: "Polar Landscape Bright Ethereal Radiance",
    prompt: "Bright natural polar light creating flattering almost ethereal radiance on skin and brilliant white of outfit making subject stand out with pristine glow against vast snow landscape. Subtle pinpoint specular highlights on eyes reflective water surface and potentially ice crystals on snow — crisp photographic sparkle adding touch of life and realism the eye might not fully appreciate in such vast bright landscape. Outstanding handling of extreme brightness range preserving both sparkling highlights and subtle shadow details across snow and ice.",
  },
  {
    id: "lighting_059",
    title: "Luminous Diffused Luxury Ambient",
    prompt: "Soft expansive highly diffused ambient lighting mimicking glow of large window on overcast day or professional large-source studio diffusion. Luminous sculpting creating gentle yet defined three-dimensional forms through nuanced light fall-off — no harsh shadows or flat areas making everything appear radiant and perfectly illuminated almost existing in idealized space. Delicate precise specular highlights on reflective surfaces like polished metal glassware and glossy textures sparkling with refined photographic pop — carefully rendered points of light subtly communicating high quality and craftsmanship.",
  },
  {
    id: "lighting_060",
    title: "Overcast Window Wabi-Sabi Shadowless Glow",
    prompt: "Soft diffused utterly natural light emanating solely from an overcast sky through a single window. The gentle shadowless glow illuminates fine hairs on skin and delicate textures of the scene with quiet reverence. No artificial fill or reflectors — only the pale grey light of an overcast day filtering through cracked glass creating a sense of impermanence and tranquil stillness. The light falls evenly across the weathered interior without drama evoking Mono no Aware — a gentle luminosity that whispers rather than shouts.",
  },
  {
    id: "lighting_061",
    title: "Evening Streetlamp Soft Ambient Glow",
    prompt: "Soft diffused artificial lighting from overhead streetlamp or nearby light source in the evening casting a gentle warm glow that illuminates face and hair. The ambient light creates flattering illumination without harsh shadows — a touch of mystery highlighting contours softly. Mixed ambient sources with faint light trails in the background contribute to intimate urban atmosphere. The low-light conditions add a natural intimacy and slight grain characteristic of evening photography.",
  },
  {
    id: "lighting_062",
    title: "Bright Direct Daylight Defined Shadows",
    prompt: "Natural direct bright daylight casting soft but defined shadows that highlight features and surrounding textures. Strong light sensitivity creating vibrant illumination with clear tonal separation. The directional quality of the sunlight adds dimension and sculptural quality to both the subject and the architectural elements in the scene — confident editorial lighting that balances flattering portraiture with environmental context.",
  },
  {
    id: "lighting_063",
    title: "Harsh Flash Blown-Out SoundCloud DIY",
    prompt: "Harsh direct on-camera flash as primary light source with minimal ambient light. Flash creates flat high-contrast illumination eliminating natural shadows and contouring — almost two-dimensional rendering. Intense almost glaring specular highlights on lips eyes and any reflective surfaces — stark and pronounced contributing to raw lacquered appearance central to the aesthetic. Blown-out highlights and deep unrefined shadows creating a deliberately unpolished DIY feel where the flash imperfections are the aesthetic — red-eye effect prominently visible as intentional stylistic marker.",
  },
  {
    id: "lighting_064",
    title: "Overcast Fog Uniform Ethereal Shadowless",
    prompt: "Soft diffused lighting characteristic of an overcast or foggy day creating a uniform shadowless illumination that enhances ethereal atmospheric quality. The pervasive ambient fog acts as a massive natural diffuser — light wraps evenly around the subject eliminating harsh shadows and creating a flat but hauntingly beautiful illumination. The uniformity of the light blurs the edges of reality making the entire scene feel dreamlike and otherworldly. No directional light source is apparent — the illumination seems to emanate from the atmosphere itself.",
  },
  {
    id: "lighting_065",
    title: "Strong Backlighting Blown-Out Halo Lens Flare",
    prompt: "Strong backlighting from a window or bright light source creating dramatic lens flares and a pronounced halo effect around hair and edges. The backlight pushes highlights into deliberate overexposure — blown-out areas creating luminous white flares that engulf portions of the frame with romanticized nostalgic warmth. Gentle diffused glow wraps around the subject from behind while the front remains softly illuminated by fill light. The lens flares are embraced as artistic elements rather than flaws — streaks and circles of light adding dreamlike surreal atmosphere.",
  },
  {
    id: "lighting_066",
    title: "Harsh Unfiltered Direct Lo-Fi Raw",
    prompt: "Harsh and uneven lighting likely from direct unflattering sunlight or a basic overhead room light creating strong shadows on face and body. The light is completely uncontrolled — no diffusion no fill no deliberate direction — resulting in a raw unfiltered snapshot quality that rejects commercial slickness. Strong shadow lines carve across features without softening or flattering intent. The harsh unflattering quality is central to the aesthetic — enhancing rather than detracting from the authentic lo-fi candid feel of early digital photography.",
  },
  {
    id: "lighting_067",
    title: "Natural Ambient Overcast Park Casual Even",
    prompt: "Natural ambient lighting suggesting an overcast day or shaded outdoor setting creating soft even illumination with minimal harsh shadows. The light has a casual unpretentious quality — neither dramatic nor flattering but authentically natural. Even illumination wraps around the subject without sculpting or defining features — the kind of light that exists in everyday outdoor settings without photographic intervention. The uniformity contributes to the candid snapshot quality where lighting is incidental rather than intentional.",
  },
  {
    id: "lighting_068",
    title: "Soft Directional Indoor Ambient Fill Moody",
    prompt: "Soft directional lighting from an ambient indoor source combined with a subtle fill light creating gentle highlights that sculpt features without harshness. The lighting is moody and cinematic — directional enough to create dimension but soft enough to avoid stark shadows. The fill light prevents deep shadow areas while maintaining atmospheric depth. The overall effect is controlled yet natural-looking — the kind of carefully balanced indoor illumination that creates a brooding intimate atmosphere.",
  },
  {
    id: "lighting_069",
    title: "Soft Expansive Ambient North Window Pearlescent",
    prompt: "Soft expansive ambient light from a large north-facing window creating subtle flattering gradations of light and shadow that sculpt features with gentle three-dimensionality. The indirect northern light provides consistent diffused illumination with a delicate almost pearlescent quality — evoking natural purity and gentle grace. The gradual transitions from light to shadow are nuanced and refined — sculpting soft jawlines and high cheekbones with understated elegance. No harsh directional source — the light feels enveloping and inherently flattering.",
  },
  {
    id: "lighting_070",
    title: "Soft Even Overhead Indoor Documentary",
    prompt: "Soft even lighting from diffused overhead indoor light sources creating minimal shadows that allow every intricate detail to be clearly visible. The illumination is functional and documentary in character — prioritizing clarity over atmosphere. Even distribution across the subject eliminates dramatic shadows and specular highlights — a neutral lighting environment that lets the objects speak for themselves. The clarity of the illumination surpasses casual observation making fine details and subtle tonal variations plainly visible.",
  },
  {
    id: "lighting_071",
    title: "Soft Ambient Natural Window Intimate Luxurious",
    prompt: "Soft ambient lighting primarily from natural light filtering through a window — creating gentle highlights and soft diffused shadows that contribute to an intimate luxurious atmosphere — naturally illuminated rather than overtly staged enhancing an effortless quality — the golden light adding warmth without harsh directionality.",
  },
  {
    id: "lighting_072",
    title: "Natural Ambient Overcast Dappled Outdoor Candid",
    prompt: "Natural ambient light from an overcast day or dappled sunlight filtered through trees — creating soft even illumination without any artificial manipulation — subtle highlights and shadows that define features and textures contributing to a genuine unvarnished candid feel — a slightly flat naturalistic documentary quality rather than dramatic artful light.",
  },
  {
    id: "lighting_073",
    title: "Soft Even Interior Computational Flash Luminous",
    prompt: "Soft even lighting from interior ambient lights combined with powerful computational flash or advanced low-light processing — creating uniform flattering illumination that minimizes imperfections — smoothing skin texture and creating a luminous halo around hair and edges — an effect entirely engineered by the camera's algorithms not typically seen by the naked eye — deliberately sculpting features for maximum visual appeal.",
  },
  {
    id: "lighting_074",
    title: "Harsh Direct Flash Raw Unflattering",
    prompt: "Harsh direct on-camera flash creating strong unflattering highlights and deep pronounced shadows — giving the image a raw almost voyeuristic unpolished feel — stark almost brutal illumination capturing every detail without idealization — stripping away any flattering quality and replacing it with gritty confrontational directness.",
  },
  {
    id: "lighting_075",
    title: "Soft Even Diffused Indoor Gentle Highlight",
    prompt: "Soft even lighting from diffused indoor sources — creating gentle highlights and minimal shadows that define outfit textures and the subject's dynamic form — flattering balanced illumination that feels clean and modern.",
  },
  {
    id: "lighting_076",
    title: "Ring Light Diffused Indoor Flattering Selfie",
    prompt: "Soft even lighting likely from a ring light or diffused indoor source — creating flattering highlights on skin and a bright inviting glow without harsh shadows — giving the complexion an almost flawless airbrushed quality that is often sought after in selfie photography — warm inviting luminosity suited for intimate direct-to-camera compositions.",
  },
  {
    id: "lighting_077",
    title: "Soft Highlighting Floral Texture Serene",
    prompt: "Soft lighting that highlights the textures of flowers and the smoothness of skin — gentle even illumination creating a serene almost ethereal quality — delicate light that enhances organic surfaces and complexion without harsh shadows or strong directionality.",
  },
  {
    id: "lighting_078",
    title: "Dim Moody Side-Lit Soft Glow",
    prompt: "Dim lighting creating a moody atmosphere — light source coming from one side casting a soft glow on the face — contributing to a dreamy slightly out-of-focus quality — adding a sense of mystery and depth to the scene.",
  },
  {
    id: "lighting_079",
    title: "Soft Subtle Shadows Contour Sculpting",
    prompt: "Soft lighting creating subtle shadows that emphasize the contours of the body and the texture of sheets and fabric — intimate and sculpting without harsh directional quality — a gentle illumination that defines form through nuanced shadow gradations.",
  },
  {
    id: "lighting_080",
    title: "Soft Warm Glow Indoor Cozy Ambient",
    prompt: "Soft lighting casting a warm glow over the scene — contributing to a calm organized atmosphere with cozy ambiance — warm indoor illumination from ambient sources creating gentle highlights and a sense of domestic comfort.",
  },
  {
    id: "lighting_081",
    title: "Dramatic Spotlight Indoor Runway Contrast",
    prompt: "Indoor spotlight focused on the central figure creating dramatic contrast between the brightly lit subject and the dim surroundings — theatrical illumination that separates subject from dark background — the kind of directional concentrated light typical of fashion runway or stage photography.",
  },
  {
    id: "lighting_082",
    title: "Direct Flash Overexposed Bathroom Dorm",
    prompt: "Direct flash photography possibly overexposed — bathroom mirror dorm light or club dressing room — unnatural light that makes skin pop and shadows vanish — background nearly blown out with just the suggestion of a mirror tiles or curtain — harsh flash straight-on erasing natural depth and flattening the scene.",
  },
  {
    id: "lighting_083",
    title: "Overhead Light Plus Lamp Warm Diffused",
    prompt: "Overhead light combined with a lamp beside the subject for a warm glow — or natural diffused light from a sheer-curtained window or fairy lights behind — creating gentle warm illumination that softens the scene — the overhead angle making the subject look smaller and more contained.",
  },
  {
    id: "lighting_084",
    title: "Early Morning Natural Kitchen Window Warm",
    prompt: "Early morning light through a kitchen window — natural warm illumination creating a honeyed glow — soft enough to blur steam and create a gentle atmosphere — light from one side softly illuminating the face — warm and enveloping rather than harsh or directional — the quality of dawn light that makes everything feel tender.",
  },
  {
    id: "lighting_085",
    title: "Soft Gold Diffused Sunlight North-Facing Window",
    prompt: "Soft gold diffused sunlight from a north-facing window — warm backlit glow that catches movement and texture — 7:30 to 8:00AM quality morning light — soft diffuse illumination from a tall window with sheer curtains — honeyed luminosity creating a painterly warmth — natural light only with white balance set warm for golden tone.",
  },
];

export const ColorPalette = [
  {
    id: "colorpalette_001",
    title: "Calibrated Golden Ratio",
    prompt: "Scientifically Calibrated Visual Harmony: Vast gradient sky occupying upper two-thirds transitioning from deep short-wave blue #0855b1 at zenith through medium cyan #4fa5d8 to pale #daeaf7 near horizon line positioned precisely at lower third following rule of thirds with intentional 2% asymmetry - foreground features soft neutral stone beige wall #e1e2e6 and #ebebeb tones grounding composition - single small warm accent element in peach #ffddba or soft pink #e0829d positioned 137 pixels from left edge following golden ratio prime location - overall brightness calibrated to 70% with saturation below 30% creating calm unfiltered quality - distant bird silhouette at 0.7% frame width providing awe-inducing scale - micro-wash of 15000K color temperature in top-left 8% adding subtle cool luminosity",
  },
  {
    id: "colorpalette_002",
    title: "Pearlescent Sheen Limestone Shadow",
    prompt: "The camera flash is direct, high, and a little too strong — making the pearlescent sheen of their dress bounce, while the fabric absorbs light with matte softness, adding depth. Their legs glisten faintly, mist beading on their bare skin, not posed but completely captivating. You see the shadow of their ponytail cast on the club's limestone wall — straight and silky, a graphic line that mirrors the column behind them.",
  },
  {
    id: "colorpalette_003",
    title: "Editorial Mistake Unforgettable",
    prompt: "The color palette is cool-toned but emotionally warm: fog grey, pearl white, soft plum, antique navy, and a dash of citrus orange from the fruit they forgot they bought. It looks like an editorial mistake — like they were supposed to wear something else, arrive somewhere else — but the visual contradiction makes the image unforgettable.",
  },
  {
    id: "colorpalette_004",
    title: "Earthy Nostalgic Warm Harmony",
    prompt: "Earthy Nostalgic Vibrancy with Warm Harmony: The captivating power of this palette lies in its masterclass of harmonious analogous colors and subtle complementary accents all rendered with warmth and richness that evokes nostalgia. Greens range from deep desaturated forest green to brighter mossy greens serving as environmental anchor. Browns and greys from stacked stones offer spectrum of earthy greys warm beiges and subtle browns. Skin tones are luminous warm peachy-beige with subtle rosy blush perfectly balanced. Vibrant harmonious accents include teal sky blue providing complementary contrast golden yellow orange providing warmth and deep red burnt orange adding sophisticated depth",
  },
  {
    id: "colorpalette_005",
    title: "Cool-Toned Sophistication Luminous",
    prompt: "Cool-Toned Sophistication with Luminous Depth: Overall color palette leans towards cool blues and desaturated neutrals creating sophisticated calm atmosphere. Deep navy combined with muted background tones feels harmonious and understated. Base colors are soft muted pale pinks whites and light grays creating serene peaceful ambiance. Cool blues dominate from deep navy to soft sky tones and desaturated teals. Neutrals form foundation - bone whites pearl grays soft beiges antique ivories. Skin tones while cool maintain luminous quality appearing fair and delicate. Rich deep blacks provide contrast and depth without being crushed",
  },
  {
    id: "colorpalette_006",
    title: "Watercolors Left Sun",
    prompt: "Warm Neutrals with Soft Pastel Accents: Sophisticated blend dominated by cream dusty rose pale gold and powder blue creating dreamy romantic atmosphere. Palette stays firmly in warm-neutral territory with occasional cool breaths. Ivory and champagne tones form base creating luminous foundation. Soft whites appear pure but never stark always carrying hint of warmth. Beiges range from pale almond to deeper camel all with subtle golden undertones. Blush and rose tones appear delicately never bright or saturated but rather faded like watercolors left in sun",
  },
  {
    id: "colorpalette_007",
    title: "Aged Watercolor Painting",
    prompt: "Dusty Blues Creams and Faded Sienna: Sophisticated muted palette evoking vintage elegance with soft powder blue as dominant cool tone paired with warm cream ivory and bone whites - accents of faded terracotta sienna and rust adding earthy warmth - subtle grey-blue shadows creating depth - overall effect is refined and nostalgic like aged watercolor painting",
  },
  {
    id: "colorpalette_008",
    title: "Quiet Luxury",
    prompt: "Champagne Cream and Dusty Rose: Luxurious soft palette dominated by warm champagne and cream tones as luminous base - dusty rose and blush pinks adding romantic feminine quality - hints of antique gold and pearl creating subtle shimmer - palette whispers rather than shouts evoking quiet luxury and timeless elegance",
  },
  {
    id: "colorpalette_009",
    title: "Porcelain Figurine Melancholy",
    prompt: "The color palette is poetic and restrained: cloud white, pale butter, faint ash pink, milk blue, and cherry red. The flash exaggerates the cool tones, making them glow like a porcelain figurine, but there's a soft melancholy in their gaze, a wistful innocence in the slouch of their shoulders.",
  },
  {
    id: "colorpalette_010",
    title: "Spa-Like Tranquility Minimalist",
    prompt: "Pale Lavender Dove Grey Soft Mint: Cool serene palette with pale lavender as ethereal primary tone - dove grey providing neutral sophistication - soft mint adding fresh organic element - overall effect is calming and dreamy with spa-like tranquility and modern minimalist aesthetic",
  },
  {
    id: "colorpalette_011",
    title: "Rustic Wilderness Natural",
    prompt: "Rustic Wilderness Charm: Rugged earthy palette celebrating natural textures - varied warm and cool greys deep browns and subtle reddish-browns from weathered rocks showcasing mineral composition - rich vibrant greens from lush mosses sedum and ground cover ranging from bright lime to deep forest hues - delicate soft pink accents from tiny star-shaped flowers - creamy whites providing subtle highlights - hints of muted yellow-orange from dried lichen - entirely natural unmanipulated colors creating grounded organic serene complexity",
  },
  {
    id: "colorpalette_012",
    title: "Micro-Ecosystem",
    prompt: "Rugged Serenity: Grounded blend of natural variegated greys and browns from rocks intermingled with lush vibrant greens and punctuated by delicate soft pinks and whites. Dominant structural tones include variegated greys and browns from rocks providing rich tapestry of cool greys warm browns subtle rusts and earthy ochres forming strong foundational elements - deep mossy greens from patches of moss and darker foliage introducing deep saturated greens that cling to rocks adding texture and life. Vibrant biological tones include lush greens from small succulent-like plants and ground cover vibrant healthy green indicating life and growth - soft pinks and whites from tiny flowers delicate almost pastel pink and pure white providing charming bright accents against rugged backdrop. Palette creates textural richness through interplay of rough aged rocks with soft living plants - delicate flowers blooming amongst harsh unyielding rocks evoke powerful sense of resilience beauty in unexpected places and persistence of life - colors entirely drawn from nature and feel perfectly balanced vibrancy of greens and flowers prevents greys and browns from feeling dull while rocks provide grounding force for delicate blooms - palette and composition invite close quiet observation of micro-ecosystem fostering sense of calm and appreciation for small details - undeniable authenticity and earthiness to palette feels real unadulterated and deeply connected to natural world.",
  },
  {
    id: "colorpalette_013",
    title: "Portra 400 Curated Artistic",
    prompt: "Sophisticated Warm-Neutral Color Grade for Earthy Nostalgic Vibrancy: Apply sophisticated warm-neutral color grade meticulously calibrated to evoke color science of Kodak Portra 400 film aesthetic. Overall color palette subtly desaturated yet rich and vibrant creating expensive and timeless aesthetic that feels more curated and artistic than direct unedited capture. Greens of background warm and inviting not overly yellow or harsh. Skin tones rendered with natural luminous quality rich in subtle healthy undertones peaches and creams avoiding any plastic overly smoothed or digitally flat appearance. Excellent color separation where different hues remain distinct and harmonious within overall palette contributing to visual pleasure.",
  },
  {
    id: "colorpalette_014",
    title: "Muted Cool Suburban Mundanity",
    prompt: "Slightly muted cool tones evoking suburban mundanity - the colors should lean towards cooler greens and blues in the environment with bright whites being almost clinical due to the flash - patterned fabrics should retain their design but with a slightly desaturated muted feel - this palette evokes a sense of suburban mundanity and mild detachment against which rebellious acts stand out.",
  },
  {
    id: "colorpalette_015",
    title: "Portra 400 Warm Americana Radiance",
    prompt: "Apply a warm natural and subtly rich color grade directly mimicking the color science of Kodak Portra 400 film. Flattering skin tones natural radiance - skin tones must be rendered with Portra's signature exceptionally natural and luminous quality rich in subtle warm undertones that make her appear effortlessly radiant - this specific film stock is renowned for its ability to capture human skin beautifully giving her a healthy sun-kissed look that feels authentic. Warm earthy palette grounded elegance - browns and warm neutrals in the scene should be rich warm and inviting creating a grounded classic aesthetic - whites and creams should hold a subtle warmth rather than being stark blending harmoniously with the overall palette. Subtle color separation visual harmony - even within the predominantly warm palette ensure excellent color separation allowing greens of foliage or deep blacks to remain distinct yet harmonious contributing to the overall visual richness.",
  },
  {
    id: "colorpalette_016",
    title: "Earthy Nostalgic Vibrancy Warm Harmony",
    prompt: "Earthy nostalgic vibrancy with warm harmony - the captivating power of this palette lies in its masterclass of harmonious analogous colors and subtle complementary accents all rendered with a warmth and richness that evokes nostalgia. Dominant hues primarily analogous built around variations of greens yellow-greens and yellows with warm brown undertones. Vibrant harmonious accents approximately 15-20% providing visual energy and sophisticated contrast. Analogous harmony greens yellows browns - the dominant use of greens browns and warm skin tones leaning into the yellow-orange spectrum creates an inherently soothing and natural harmony making the image feel grounded organic and easy on the eyes. Strategic complementary contrast teal-blue versus oranges-browns - by introducing cooler tones in a vibrant yet contained manner the warmer elements skin hair earth tones pop and feel more alive creating a subtle visual tension that adds dynamism without discord - this is a classic technique for making colors sing. Skin tone as a central anchor emotional connection - the perfectly rendered warm peachy-beige skin tone approximately 10-15% of the image is not just a color it is the emotional anchor - its natural warmth and subtle luminosity make the subject feel real healthy and approachable - in color theory warm skin tones often harmonize beautifully with earthy greens and blues making the subject feel integrated into the natural environment - the photographic rendering of this skin tone with its delicate highlights and shadows is key to its captivating quality. Golden hour warmth nostalgia and softness - even if not shot during literal golden hour the overall warm shift in the color grading imbues the entire scene with a soft nostalgic glow - this is not just a filter it is a subtle manipulation of the white balance and color curves that makes everything feel slightly softer more inviting and imbued with a sense of cherished memory. Depth and richness through micro-contrast - the colors are not flat - there is a subtle depth to each hue a richness that makes them feel tactile and full - this is achieved through the camera's ability to capture micro-contrast within each color making the colors feel dimensional and luxurious. Quiet pop from film emulation - the colors have a pop without being garish - they are vibrant enough to be eye-catching but the overall warmth and subtle desaturation characteristic of Kodak Portra 400 film prevent them from being overwhelming - this specific film aesthetic renders colors with a beautiful natural vibrancy that avoids harsh digital saturation contributing to the timeless authentic feel.",
  },
  {
    id: "colorpalette_017",
    title: "Cool Winter Editorial Jewel Tones",
    prompt: "Harmonious palette sophisticated dream - the overall color harmony should evoke a sense of dreamlike sophistication and refined allure contributing to the ethereal glamour. Apply a cool clean yet subtly vibrant color grade reminiscent of a high-fashion winter editorial. Luminous skin tones healthy glow - her skin tones should maintain a healthy natural glow despite the cool environment avoiding any overly desaturated or cold appearance ensuring her beauty remains warm and inviting. Vibrant jewel tones striking accents - any jewel-toned elements should exhibit extraordinary vibrancy and depth of color rendered with a richness and clarity that makes them visually pop against pale skin a photographic enhancement that highlights their preciousness. Apply a clean vibrant yet naturally balanced color grade leaning slightly towards cool blues and warm neutrals in attire. Crisp cool whites freshness - whites and light tones should be rendered with crisp cool quality and subtle blue undertones conveying freshness and clean air. Vibrant greens lush life - any greens in the scene should be vibrant and lush adding life and depth showcasing the camera's ability to render a wide spectrum of natural hues.",
  },
  {
    id: "colorpalette_018",
    title: "Cool Desaturated Minimalist Curated",
    prompt: "Apply a cool-toned slightly desaturated color grade reminiscent of a modern minimalist aesthetic often seen in high-end lifestyle photography. Cool clean palette sophisticated calm - the overall color palette should lean towards cool blues and desaturated neutrals creating a sophisticated and calm atmosphere - dark clothing combined with muted tones of the background should feel harmonious and understated. Luminous skin tones ethereal glow - her skin tones while cool should maintain a luminous quality appearing fair and delicate against dark hair and the muted background - this precise rendering of skin tones is crucial for the ethereal effect. Rich deep blacks depth and contrast - ensure rich deep blacks providing contrast and depth without being crushed - the camera's dynamic range preserves detail even in these dark areas.",
  },
  {
    id: "colorpalette_019",
    title: "Vibrant Saturated Pastels Dreamy Pop",
    prompt: "Apply a vibrant high-saturation color grade leaning towards a bright pastel-infused palette reminiscent of Japanese aesthetic trends while maintaining a sense of dreamy warmth. Saturated pastels lively innocence - reds and pinks in the environment should be intensely saturated but maintain a pastel-like softness creating a vibrant backdrop that feels both energetic and whimsical - light clothing should remain clean and bright with subtle texture acting as a luminous canvas for the colorful light - the camera's color processing ensures these hues are rendered with an almost painterly intensity that is beyond natural observation. Luminous skin tones enhanced youthfulness - her skin tones must be rendered with a natural luminous quality with a healthy subtle flush avoiding any overly desaturated or artificial appearance - this fidelity to natural skin while subtly enhanced contributes to her youthful and alluring innocence. Overall warmth with pop dreamy vibrancy - the overall image should possess a subtle warmth making it inviting while the vibrant background elements retain their pop - this balance creates a dreamy soft aesthetic with a lively energetic undertone.",
  },
  {
    id: "colorpalette_020",
    title: "Desaturated Elegance Porcelain Red Lip",
    prompt: "Apply a sophisticated cool-toned yet luminous color grade meticulously calibrated to evoke a high-fashion editorial aesthetic. Subtly desaturated elegance aspirational timelessness - the overall color palette should be subtly desaturated allowing warm golds and metallics to truly sing against muted background tones - this creates an expensive and timeless aesthetic that feels more curated and artistic than a direct unedited capture enhancing the ethereal and glamorous aura - cool tones in the background provide a sophisticated contrast to the warmth of skin and attire. Porcelain skin tones flawless beauty - her skin tones must be rendered with a porcelain-like luminosity rich in subtle healthy undertones cool pinks warm peaches avoiding any plastic overly smoothed or digitally flat appearance - this fidelity to natural skin while subtly enhanced for flawlessness contributes to her captivating beauty. Vibrant lip and eye contrast focal intensity - the deep red of her lipstick and the precise definition of her eyes should provide a striking yet harmonious contrast against her pale skin - this selective vibrancy draws the viewer directly to her captivating gaze a deliberate photographic choice to intensify her presence.",
  },
  {
    id: "colorpalette_021",
    title: "Clean Alpine Warm-Neutral",
    prompt: "Clean bright and slightly warm color grade emphasizing natural beauty and a sophisticated alpine palette — neutral warmth dominated by creamy whites soft beiges and warm browns in attire complemented by crisp whites of snow vibrant greens of the valley and cool blues of distant sky — whites appear pure and greens lush while maintaining subtle overall warmth that evokes comfort and luxury — vibrant yet natural greens of alpine vegetation rendered with lush saturation without appearing artificial — skin tones rendered with a healthy natural glow appearing smooth yet retaining subtle texture contributing to radiant and approachable beauty",
  },
  {
    id: "colorpalette_022",
    title: "Cool Gothic Monochromatic Stone",
    prompt: "Cool-toned slightly desaturated color grade emphasizing the stark beauty of a nighttime architectural scene — monochromatic dominance leaning towards cool greys desaturated creams and deep blacks allowing architectural details to speak for themselves — this near-monochromatic approach enhances timeless gothic elegance giving the architecture an almost sculptural quality — where floodlights hit stone a subtle warm golden glow provides just enough contrast to prevent the image from feeling flat — reflections on wet ground pick up subtle hints of deep blue or indigo from distant city lights adding mysterious cool color — a detail often more apparent in a photograph than to the casual observer",
  },
  {
    id: "colorpalette_023",
    title: "Cool Fine Art Teal Dreamscape",
    prompt: "Clean slightly cool-toned color grade with subtle warmth in skin tones reminiscent of classic fine art portraiture or high-key film stocks. Background should be a deep rich desaturated teal or muted blue-grey providing a sophisticated cool counterpoint to warm skin and hair — this specific hue rendered with photographic precision creates an almost infinite dreamlike stage for the subject — the depth of color feels deliberately chosen and enhanced.",
  },
  {
    id: "colorpalette_024",
    title: "Cross-Processed Indie Blue-Grey",
    prompt: "Distinctive film-emulated color grade specifically mimicking the cross-processed aesthetic of pushed Portra or Fuji film stock. The entire image bathed in a dominant slightly desaturated blue-grey hue affecting skin tones shadows and highlights — this specific blue is not natural but a chemical reaction of the film process creating an instantly recognizable nostalgic atmospheric coolness that defines the indie film vibe. Within this blue cast allow for very subtle almost accidental pushes of red or magenta in cheeks and lips — a characteristic artifact of cross-processing that adds organic slightly imperfect beauty feeling deeply authentic and emotionally resonant. Overall contrast should be soft and gentle preventing any harshness and contributing to a dreamlike ethereal quality — this low-contrast rendering is a hallmark of certain film stocks allowing for subtle tonal shifts that enhance melancholic mood.",
  },
  {
    id: "colorpalette_025",
    title: "Nostalgic Warmth Soft Pastels",
    prompt: "Warm slightly desaturated and luminous color grade reminiscent of vintage film stock Portra 800 or Fuji Superia 400 emulation. Overall color palette leans towards soft pastels — pinks creams muted greens and golden browns. These colors gently desaturated and warmed by the camera's processing evoke a sense of sweet nostalgia and innocent beauty making the scene feel like a cherished memory.",
  },
  {
    id: "colorpalette_026",
    title: "Cozy Chic Rich Neutrals",
    prompt: "Warm inviting and slightly desaturated color grade reminiscent of a curated lifestyle blog or high-end interior design aesthetic. Rich neutrals dominate — charcoal grey warm off-whites and soft earth tones rendered with deep yet soft sophistication that feels luxurious not dull. Subtle warm tint with a gentle golden undertone enhances the feeling of comfort and invitation making the home environment feel welcoming and aspirational. Skin tones rendered with a natural healthy luminous glow rich in subtle undertones — warm peaches soft roses — appearing authentic and approachable. Sophisticated neutrals in fabrics and fur rendered with rich nuanced tones avoiding any flatness — the camera's color science accurately captures subtle variations creating understated luxury. Overall color harmony should be inviting and calming with muted background tones complementing subjects creating a cohesive curated visual experience.",
  },
  {
    id: "colorpalette_027",
    title: "Clean Warm-Neutral Productive Radiance",
    prompt: "Clean slightly warm-neutral color grade meticulously calibrated to evoke a modern polished aesthetic. Natural luminous skin tones rich in subtle undertones — warm browns soft reds — avoiding any artificial smoothness or overly saturated appearance contributing to approachable and inviting radiance. Balanced whites and neutral tones in background walls and paper should be clean without color casts creating a fresh uncluttered backdrop that enhances the feeling of an organized productive environment. Subtle vibrancy and positive energy in the overall color harmony contributing to the aspirational and comforting mood without being overtly bright or distracting.",
  },
  {
    id: "colorpalette_028",
    title: "Fujifilm Classic Chrome Profile",
    prompt: "Fujifilm Classic Chrome color profile emulation — desaturated yet rich color rendering with subdued warm tones and deepened shadows. Colors appear muted and sophisticated with a documentary-like quality — reds shift toward orange greens become more olive and blues take on a cooler steel quality. Skin tones rendered with natural warmth but without the typical Portra-style flattery — more honest and grounded. Overall contrast is slightly elevated in the midtones creating a punchy yet refined look that feels editorial and timeless. The Classic Chrome rendering gives images a distinctly analog character without heavy grain — a digital interpretation of classic photojournalistic film stocks.",
  },
  {
    id: "colorpalette_029",
    title: "Soft Neutral Creative Whiteboard",
    prompt: "Soft neutral color story with a whisper of warmth — whiteboard surfaces rendered as a bright clean white but not clinical or cold. Marker ink appears as vibrant intelligent blue or deep emerald green — colors that feel creative and focused against the neutral backdrop. Skin tones rendered with a natural healthy and luminous quality. Materials and clothing feel tactile and real with accurate color rendering. The overall palette creates a calm sophisticated workspace atmosphere where creative energy is expressed through selective pops of color against an otherwise restrained neutral foundation.",
  },
  {
    id: "colorpalette_030",
    title: "Neutral D65 Technical Workspace",
    prompt: "Neutral white balance at D65 illuminant. Blue ink rendered with precise chromaticity at sRGB #0078D7. Skin tones maintained within ITU-R BT.709 gamut — accurate and natural without warm or cool bias. Semi-gloss whiteboard surface showing legible text. Denim rendered with micro-contrast of warp and weft texture. Natural subsurface scattering on skin with tone retention. Marker plastic specularity with saturated pigment deposition. The color science is technically precise and calibrated — communicating professional clarity.",
  },
  {
    id: "colorpalette_031",
    title: "Natural True-to-Life Smartphone Warm",
    prompt: "Modern slightly warm-neutral color grade typical of popular social media aesthetics optimized for clean presentation. Natural true-to-life palette with accurate representation of skin tones off-white surfaces and muted beige walls — making the scene highly relatable and grounded. Subtle boost in vibrancy and clarity making colors pop just enough to be engaging without appearing artificial — the slight enhancement that makes a good smartphone photo stand out providing appealing visual crispness beyond raw perception.",
  },
  {
    id: "colorpalette_032",
    title: "Analog Film Warm Desaturated European",
    prompt: "Sophisticated slightly warm-neutral color grade evoking the color science of classic analog film such as Fuji Pro 400H or Portra 160 emulation. Subtly desaturated with gentle emphasis on greens and blues creating an expensive timeless aesthetic that feels more like a cherished memory than a raw photograph. Luminous skin tones rich in subtle undertones avoiding plastic or overly smoothed appearance. Excellent color separation where different hues — off-white clothes warm basket tones warm stone — remain distinct and harmonious within the muted palette.",
  },
  {
    id: "colorpalette_033",
    title: "Subtly Rich Warm Medium Format Natural",
    prompt: "Sophisticated subtly warm-toned color grade evoking classic analog film balanced for natural saturation such as Fuji Velvia 50 or Portra 160 emulation. Harmonized palette with greens that feel organic and vibrant and yellows possessing delicate warmth — subtly elevated by the camera creating cohesive aesthetically pleasing visual that feels more artistic and alive. Subtle shifts in hue and luminosity within greens conveying realistic depth in foliage. Luminous skin tones rich in subtle undertones peaches creams soft reds — avoiding plastic flat or overly smoothed appearance.",
  },
  {
    id: "colorpalette_034",
    title: "Portra 800 Warm Organic Film",
    prompt: "Warm-toned natural film emulation color grade characteristic of Portra 800 or Fuji 400H. Rich organic color palette with verdant greens warm browns and creamy whites rendered with film's characteristic warmth and subtle saturation shifts — inherently nostalgic and harmonious. Luminous skin tones rich in subtle healthy undertones — authentic rendering contributing to raw natural beauty and vulnerability. Subtle natural color shifts within greens and browns giving foliage and background organic depth and vibrancy that feels alive.",
  },
  {
    id: "colorpalette_035",
    title: "Soft Pastel Fuji Pro 400H Romantic",
    prompt: "Sophisticated warm warm-neutral color grade evoking the color science of classic Fuji Pro 400H film. Soft pastel tones in dress combined with muted verdant greens in foliage and golden earthy browns in tall grass — deliberate desaturation and harmonious color blending creating timeless romantic quality more poetic and less literal than digital color. Skin tones rendered with natural creamy luminescence rich in subtle healthy undertones. Excellent color separation where different hues remain distinct and subtly vibrant even within a muted palette.",
  },
  {
    id: "colorpalette_036",
    title: "Muted Pastel Desaturated Regencycore",
    prompt: "Muted slightly warm-toned color grade evoking classic fine art photography or historical portraiture. Subtly desaturated pastel palette leaning toward soft earth tones creating aged yet pristine aesthetic that feels deeply nostalgic and romantic. Creamy off-white of fan and crisp white of dress feeling rich and textured not stark. Luminous skin tones with delicate rosy undertones on cheek and ear contributing to gentle graceful appearance. Harmonious soft muted greens of distant foliage acting as unobtrusive backdrop supporting the subject without competing.",
  },
  {
    id: "colorpalette_037",
    title: "Cool Desaturated Indie Film Noir",
    prompt: "Distinctive cool-toned color grade characteristic of experimental film photography or early 2000s indie cinema. Heavily desaturated with strong emphasis on blues greys and muted blacks — making the few warm tones like blush on cheeks or subtle cream of a flower stand out with symbolic focus. Vibrant isolated accents — a pale pink or cream flower retaining fragile warmth against the cool backdrop as symbolic focal point. Rich deep inky blacks retaining subtle textural detail — avoiding completely crushed shadows while adding dramatic depth and sophistication.",
  },
  {
    id: "colorpalette_038",
    title: "Warm Spring Pastel Cottagecore",
    prompt: "Bright slightly desaturated warm-toned color grade reminiscent of sun-drenched slightly faded spring photograph. Soft pastel greens and yellows in grass and foliage allowing vibrant yellows of floral dress to truly pop — evoking freshness and gentle beauty of spring. Warm golden hues particularly in highlights giving entire image nostalgic sun-kissed glow — comforting and idyllic like a cherished memory. Excellent color separation between background greens and foreground dress colors maintaining visual harmony.",
  },
  {
    id: "colorpalette_039",
    title: "Soft Desaturated 90s Editorial Cool",
    prompt: "Sophisticated slightly desaturated cool-neutral color grade with a touch of warmth in skin tones characteristic of high-fashion editorials from the 90s era. Rich vibrant reds and pinks of roses not oversaturated providing beautiful focal point against subdued palette — nuanced color contrast that feels intentional and artistic. Creamy off-white and warm beige tones of kraft paper and knit sweater. Deep rich blacks in background. Overall palette balances cool sophistication with warm organic elements.",
  },
  {
    id: "colorpalette_040",
    title: "Warm Vintage Film Golden Road Trip",
    prompt: "Warm-toned slightly desaturated color grade reminiscent of classic analog film such as Fuji Pro 400H or Portra 160 emulation. Dominant warm golden and amber hues especially in highlights and mid-tones — muted greens of exterior allowing golden light to take precedence. Soft pink of a flower rendered vibrantly but gently standing out against muted browns and greys of car interior. Car upholstery having a rich slightly faded brown tone contributing to nostalgic lived-in feel. Overall palette feels sun-drenched and warmly preserved like a golden memory.",
  },
  {
    id: "colorpalette_041",
    title: "Portra 400 Warm Naturalistic Fur Coat",
    prompt: "Sophisticated warm-neutral color grade evoking the color science of classic Kodak Portra 400 film aesthetic. Subtly desaturated yet rich and complex palette creating authentic timeless aesthetic that feels organic and artistic rather than direct digital capture. Luminous skin tones rich in subtle undertones warm peaches cool beiges avoiding plastic or flat appearance. Excellent color separation where different hues — browns of fur versus greens of background — remain distinct and vibrant even within a muted palette.",
  },
  {
    id: "colorpalette_042",
    title: "Bold Desaturated Late 90s Editorial",
    prompt: "Bold high-contrast color grade with slightly cool desaturated undertone reminiscent of classic fashion editorials from late 90s and early 2000s. Desaturated blues and greys in sky and ocean conveying vastness and slightly bleak yet grand atmosphere. Brilliantly bright almost luminous whites of dress and sea foam creating stark pure contrast against turbulent ocean. Natural skin tones with subtle warmth maintained despite high contrast — preventing sickly or artificial appearance. Very fine subtle organic film-like grain adding gritty authentic timeless quality.",
  },
  {
    id: "colorpalette_043",
    title: "Portra 400 Wilderness Sublime Harmony",
    prompt: "Kodak Portra 400 film color grade characterized by exquisite natural skin tones with subtle warmth and luminosity. Muted blues and greys of water and sky slightly desaturated but deeply rich conveying vast majestic calm. Creamy luminous whites of lace and plush coat fabrics. Cool tans and greys of ancient mountain rock. Overall harmonious desaturated richness feeling more profound than digital equivalent — film's characteristic ability to balance vibrant and subdued hues creating sublime color palette that is inherently artistic and emotionally resonant.",
  },
  {
    id: "colorpalette_044",
    title: "Warm Desaturated Portra Square Format",
    prompt: "Warm slightly desaturated color grade reminiscent of classic medium format film stocks Kodak Portra 400 or Fuji Pro 400H. Soft expansive sky blues and brilliant fluffy cloud whites with subtle warmth — avoiding sterile tones. Natural sun-kissed skin tones with subtle healthy warmth avoiding overly processed appearance. Muted pastel tones of delicate dress with off-white and subtle floral patterns — soft elegance allowing texture and pattern to show through without being overly vibrant. Overall palette evoking vastness freedom and idyllic summer days.",
  },
  {
    id: "colorpalette_045",
    title: "Portra 400 Bohemian Earthy Jewel-Toned",
    prompt: "Warm natural slightly analog color grade consistent with Kodak Portra 400 or Fuji Superia 400 film stock. Natural warm skin tones showing subtle variations and soft inviting glow. Harmonious blend of warm earthy browns and khakis with rich jewel-toned accents — teals reds yellows indigos — rendered with film's inherent color blending creating distinctly bohemian artfully assembled palette. Natural greens leaning toward warm olives rather than harsh artificial greens. Fine organic film grain subtly visible lending irreplaceable authenticity depth and nostalgic charm.",
  },
  {
    id: "colorpalette_046",
    title: "Punchy Natural Summer Vibrant Film",
    prompt: "Vibrant yet natural and slightly warm color grade evoking classic analog film such as Fuji Pro 400H or Portra 400 for vibrant greens and blues with warm skin tones. Deep saturated almost cerulean blue sky contrasting beautifully with bright whites of daisies and vibrant natural greens. Luminous warm skin tones rich in golden and peach undertones — healthy sun-kissed aesthetic. Outstanding color separation where distinct hues of blue sky white flowers green foliage and dark clothing remain vibrant and clearly defined. Overall palette radiates summer energy and natural beauty.",
  },
  {
    id: "colorpalette_047",
    title: "Portra 400 Earthy Nostalgic Forest",
    prompt: "Sophisticated warm-neutral color grade meticulously calibrated to Kodak Portra 400 film color science. Subtly saturated featuring Portra's signature rich greens warm browns and earthy tones balanced by clean luminous whites — earthy nostalgic vibrancy that is distinctly photographic. Skin tones with Portra's legendary natural luminosity rich in subtle warm undertones. Excellent color separation — various greens of grass brown of hair white of clothing remaining distinct and vibrant within harmonious palette. Fine natural film grain consistent with Portra 400 adding authentic tactile texture.",
  },
  {
    id: "colorpalette_048",
    title: "Desaturated High-Contrast Vintage Adventure",
    prompt: "Slightly desaturated high-contrast color grade reminiscent of processed film stock — pushed Portra or cross-processed slide film emulation. Muted palette with warm undertones in wood contrasting with cooler whites and slight blue tint in shadows — creating nostalgic almost documentary-like feel. Enhanced sun-kissed warm skin tones showing subtle variations speaking to active outdoorsy lifestyle. Good color separation between warm wood and cooler tones maintaining visual clarity despite high contrast.",
  },
  {
    id: "colorpalette_049",
    title: "Desaturated Cool Urban Neo-Noir",
    prompt: "Desaturated cool-toned color grade reminiscent of raw unglamorous urban documentary or neo-noir film. Muted palette emphasizing cool blues grays and deep blacks — stripping away vibrancy to focus on raw emotion and stark reality. Natural unvarnished skin tones showing subtle imperfections and realistic undertones without idealized smoothing. Dominant consuming rich blacks retaining subtle fabric texture — adding enveloping visual weight and intense almost claustrophobic mood.",
  },
  {
    id: "colorpalette_050",
    title: "Clean Desaturated Cool-Neutral Studio",
    prompt: "Clean slightly desaturated cool-neutral color grade reminiscent of modern editorial aesthetic with precise white balance. Authentic rich grey mid-tones showcasing texture without appearing flat or dull. Crisp clean color separation on graphic elements standing out with clarity. Luminous natural skin tones rich in subtle undertones — avoiding plastic or overly smoothed appearance. Pure clean bright white background — never blown out — serving as perfect distraction-free canvas.",
  },
  {
    id: "colorpalette_051",
    title: "Vivid Warm Instagram Selfie",
    prompt: "High-contrast slightly warm-toned color grade reminiscent of early Instagram filters emphasizing vibrancy. Vivid saturated yet natural tones in hair skin and clothing — youthful energetic feel with colors that pop. Rich deep blacks in hair and dark clothing providing strong dramatic frame. Luminous slightly bronzed skin quality avoiding pale or washed-out appearance. Overall palette projects youthful magnetic confidence.",
  },
  {
    id: "colorpalette_052",
    title: "Warm Portra 400 Runway Vintage Cream",
    prompt: "Warm-neutral slightly desaturated color grade specifically emulating Kodak Portra 400 or Fuji Superia 400 film color science. Natural luminous skin tones rich in subtle undertones avoiding plastic digital smoothness. Creamy off-white and antique gold and cream of lace — soft quality not stark white — subtle color shift typical of warm-toned film imbuing with vintage elegance. Rich natural tones of long flowing brown hair — avoiding over-saturation allowing natural beauty through. Muted dark background with nuanced tonal rendering.",
  },
  {
    id: "colorpalette_053",
    title: "Warm Muted Ektachrome Mid-Century Coastal",
    prompt: "Warm-toned slightly desaturated color grade evoking classic mid-century Ektachrome or Kodachrome slide film as seen in vintage prints. Warm muted palette with dominant golden-sepia cast permeating greens and browns — creating inherent nostalgia and romance. Rich but not overly vibrant blues in sky and ocean slightly leaning toward teal or dusty blue. Luminous skin tones with subtle golden warmth characteristic of period film stocks. Rich deep slightly desaturated olive-toned greens harmonizing with warm browns of earth. Subtle film grain authenticating the analog feel.",
  },
  {
    id: "colorpalette_054",
    title: "Portra 400 Pastel Vibrancy Garden",
    prompt: "Sophisticated warm slightly desaturated color grade evoking Kodak Portra 400 film color science. Pastel vibrancy — rich and present yet softened colors of floral dress blending pinks yellows purples harmoniously as if seen through gentle haze. Lush deep slightly muted greens of foliage providing rich organic backdrop without overpowering. Luminous skin tones with natural glow subtly enhanced by film's emulsion. Deep muted greens complementing dress without competing. Overall palette feels both vibrant and dreamy — characteristic Portra quality where greens are lush but not overpowering.",
  },
  {
    id: "colorpalette_055",
    title: "Warm Golden Natural Spa Harmony",
    prompt: "Natural yet slightly enhanced color grade emphasizing warm golden tones against cool blues while maintaining overall realism. Harmonious contrast between warm golden sunlight hues and cool inviting blues of hot tub tiles and water — colors rich and distinct. Vibrant yet natural greens of distant trees and browns of cabin. Subtle desaturation in deepest shadows hinting at crispness of winter air further contrasting with warmth of hot tub. Overall warm inviting spa atmosphere.",
  },
  {
    id: "colorpalette_056",
    title: "Portra 400 Pastoral Warm Romance",
    prompt: "Sophisticated warm-toned color grade evoking Kodak Portra 400 film aesthetic. Subtly saturated with predominant warmth enhancing natural greens creamy whites of horse and delicate pinks and greens of floral dress — earthy nostalgic vibrancy feeling both vibrant and timeless. Creamy textured whites of horse fur — not stark white — blending seamlessly with rich slightly desaturated greens of distant foliage. Luminous skin tones with exceptional accuracy and natural warmth rich in subtle undertones. Overall palette creating pastoral harmony and romantic dreamlike quality.",
  },
  {
    id: "colorpalette_057",
    title: "Warm Vintage Soft Pastel Idyllic",
    prompt: "Warm natural slightly vintage-inspired color grade reminiscent of Fuji Pro 400H or Portra 160 emulation. Soft slightly desaturated pastels — pastel pink slip dress and white cushions feeling gentle and comforting. Muted faded blues of outdoor rug contributing to nostalgic lived-in feel. Lush but slightly softened and desaturated greens of surrounding trees as harmonious backdrop. Overall palette exuding natural inviting warmth with harmonious visual flow that feels inherently peaceful and relaxing.",
  },
  {
    id: "colorpalette_058",
    title: "Cool Dreamlike Forest Nymph Fantasy",
    prompt: "Cool slightly desaturated yet vibrant color grade reminiscent of stylized film stock or Cinematic Teal and Orange LUT with muted greens. Dreamlike palette leaning toward cool greens and muted browns contrasted by creamy white of dress and natural skin tones — creating almost fantastical quality where foliage greens are subtly shifted to feel more ancient or magical. Delicate porcelain-like skin tones slightly pale with subtle healthy undertones contributing to faerie-like appearance. Vibrant yet subdued greens with aged almost enchanted feel distinguishing them from standard bright green.",
  },
  {
    id: "colorpalette_059",
    title: "Warm Film-Like Green Folkloric",
    prompt: "Warm slightly desaturated yet vibrant color grade calibrated to classic nature film photography aesthetic. Film-like greens and blues — rich varied greens leaning toward slightly muted earthy hues rather than overly saturated digital green. Soft pastel blues of small flowers harmonizing with natural tones. Luminous blonde hair with almost otherworldly glow appearing soft and incandescent. Soft delicate natural skin tones with subtle warmth. Overall color balance feeling organic and harmonious like a painting.",
  },
  {
    id: "colorpalette_060",
    title: "Lush Bright Summer Nature Film",
    prompt: "Bright natural slightly warm color grade characteristic of consumer film. Lush vibrant greens of foliage slightly desaturated to keep them natural rather than artificial. Golden inviting yellows of sunlight contributing to warm summery feeling. Clean bright whites with subtle hints of texture and dimension reflecting abundant light without being blown out. Natural warm healthy skin tone glow. Overall palette vibrant summery and fresh.",
  },
  {
    id: "colorpalette_061",
    title: "Portra 400 Muted Melancholic Forest",
    prompt: "Sophisticated warm-neutral color grade evoking Kodak Portra 400 film aesthetic. Muted yet rich greens of background foliage — slightly desaturated retaining organic quality avoiding aggressive vibrancy. Soft yellow wildflower accents adding warmth without competing with subject. Overall inherent gentle warmth making the image feel inviting familiar and deeply nostalgic — signature warmth of Portra film profoundly shaping emotional experience.",
  },
  {
    id: "colorpalette_062",
    title: "Soft Lavender Natural Warm-Cool Balance",
    prompt: "Soft slightly desaturated color grade with warm-cool balance emphasizing natural greens blues and delicate purple of lavender. Vibrant yet soft natural purple hues of lavender — rich accurate floral tones making them feel almost fragrant. Lush muted greens of distant trees and field as natural harmonious backdrop. Clear natural sky blues contributing to overall outdoor freshness. Warm natural sun-kissed skin tones perfectly complementing soft lighting and natural setting. Overall palette clean fresh and naturally luminous.",
  },
  {
    id: "colorpalette_063",
    title: "Kawaii Hyper-Vibrant Electric Winter",
    prompt: "Aggressively vibrant high-key color grade characteristic of popular Asian photo-editing apps or filters. Electric almost artificial blues in sky. Dazzling almost glowing whites of snow with just enough subtle texture. Hot vibrant pinks of outfit intensely saturated. Luminous slightly porcelain-like skin tones often a bit lighter than natural enhancing youthful radiance. Overall palette pushes past natural saturation into almost anime-like fantastical dreamlike quality — hyper-sweet and energetic.",
  },
  {
    id: "colorpalette_064",
    title: "Winter Wonderland Vibrant Pop",
    prompt: "Vibrant high-contrast color grade with slightly cool white balance still allowing warm accents. Crisp brilliant white snow contrasted by soft playful pinks of hat and sweater — vibrant and slightly saturated adding cheerful pop against natural backdrop. Rich warm auburn hair tones providing beautiful contrast to cool blues and whites of snow and sky acting as warm focal point. Natural slightly desaturated greens of distant trees grounding scene in reality while allowing snow and subject to dominate.",
  },
  {
    id: "colorpalette_065",
    title: "Kawaii Bright Pastel Fantasy",
    prompt: "Bright high-saturation color grade with strong emphasis on pastels and vibrant cool tones reminiscent of sugary fantastical world. Intensely saturated vibrant blues of sky and distant mountains creating stark almost fantastical contrast with overwhelming white snow — backdrop feeling like painted fantasy landscape. Luminous skin tones retaining subtle warmth beneath heavy smoothing appearing luminous and perfectly flawless enhancing doll-like appeal. Exaggerated blues with crisp fantasy feeling overall.",
  },
  {
    id: "colorpalette_066",
    title: "Sun-Drenched Muted Vintage Portra",
    prompt: "Warm slightly desaturated color grade specifically emulating color science of Kodak Portra 400 film. Luminous skin tones rendered with natural quality rich in subtle warm undertones appearing healthy and sun-kissed without overly saturated or artificial — signature Portra skin rendition. Muted rich greens leaning towards olive or forest green rather than overly vibrant creating calm natural backdrop. Golden yellows with depth and dimension appearing vibrant and cheerful but never harsh or neon. Hazy sky blues and whites contributing to expansive serene summer day feeling.",
  },
  {
    id: "colorpalette_067",
    title: "Summer Adventure Faded Film Warmth",
    prompt: "Warm vibrant slightly desaturated color grade meticulously calibrated to evoke color science of consumer-grade film stock Kodak Gold 200 or Fuji Superia 400 emulation. Faded vibrancy — greens of trees and grass and blues of sky vibrant yet subtly muted possessing warm golden cast across entire image. This faded vibrancy is distinct characteristic of older film scans imbuing scene with powerful nostalgia and warmth feeling like cherished memory of perfect summer day. Good color separation between layers of mountains trees and foreground conveying vastness and depth.",
  },
  {
    id: "colorpalette_068",
    title: "High-Fashion Warm Neutral Sophisticated",
    prompt: "Sophisticated warm-neutral color grade with rich slightly desaturated quality reminiscent of high-end fashion magazine spreads. Soft warm blonde hair subtle grey-blue of turtleneck and rich gold tones of earrings all set against softly blurred warm brown background. Subtle desaturation creating expensive and timeless aesthetic feeling more curated and artistic than direct unedited capture emphasizing sophistication over overt vibrancy. Luminous skin tones rich in subtle undertones avoiding any plastic overly smoothed appearance. Rich almost tangible gold gleam of jewelry with subtle tonal variations highlighting metallic quality.",
  },
  {
    id: "colorpalette_069",
    title: "Timeless Beauty Clean Warm-Neutral",
    prompt: "Sophisticated warm-neutral color grade meticulously calibrated for clean beauty aesthetic reminiscent of high-end fashion campaigns. Natural luminous skin tones rich in subtle healthy undertones — soft peaches warm roses — avoiding plastic overly smoothed or digitally flat appearance. Overall subtle natural saturation allowing colors to feel rich and true-to-life without overly vibrant. Deep velvety black providing classic contrast. Luminous multi-dimensional golden blonde hair rendered with exceptional detail in waves and highlights complementing skin tone and overall warm-neutral palette.",
  },
  {
    id: "colorpalette_070",
    title: "Earthy Portra Nostalgic Vibrancy",
    prompt: "Sophisticated warm-toned filmic color grade meticulously calibrated to evoke precise color science of Kodak Portra 400 film stock. Subtly desaturated yet incredibly rich and nuanced creating expensive timeless aesthetic more curated than unedited capture. Luminous skin tones with exceptional natural warmth rich in subtle undertones — warm peaches subtle reds. Lush rich slightly muted greens with incredible depth and variation avoiding artificial saturation. Deep teal or sky blue hues providing harmonious cool counterpoint to dominant warmth. Golden yellow and burnt orange pops providing controlled energetic accents. Fine organic pleasing film grain throughout — delicate evenly distributed textural element authentically mimicking Portra 400.",
  },
  {
    id: "colorpalette_071",
    title: "Nostalgic Desaturated Pastel Film",
    prompt: "Distinctive warm-cool color grade emulating classic film with emphasis on muted yet rich tones. Desaturated pastels and muted slightly faded tones particularly in blues and reds — colors feeling gently softened by time contributing heavily to nostalgic memory-like quality. Warm skin tones despite overall cooler ambient tones making subject feel vulnerable and present amidst dreamlike environment — warmth providing anchor of human emotion. Subtle yet distinct color separation preventing tones from blending into muddy mess even with desaturation and grain.",
  },
  {
    id: "colorpalette_072",
    title: "Antarctic Pristine Cool Whites",
    prompt: "Pure brilliant whites of snow and outfit with subtle cool undertones — blues and very light greys — accurately reflecting polar environment without making image feel cold. Camera color science rendering whites with almost clinical precision emphasizing pristine nature. Outstanding color separation allowing subtle blues of water dark tones of rocks and distinct black and white of wildlife to stand out clearly against dominant white contributing to visually harmonious and rich composition. Excellent handling of extreme white dominance while retaining tonal variation.",
  },
  {
    id: "colorpalette_073",
    title: "Fujifilm Classic Pristine Luxury",
    prompt: "Sophisticated warm-neutral color grade precisely tuned to evoke color science of Fujifilm classic film simulations such as Classic Chrome or Pro Neg Std. Impeccably clean and accurate white balance ensuring whites appear brilliant and inviting while maintaining subtle warmth across entire image. Rich natural saturation with exceptional separation making each hue distinct and vibrant within harmonious palette — creams golds soft blues healthy skin tones. Precise color rendering contributing to authentic sense of opulence making scene feel genuinely luxurious rather than artificially enhanced.",
  },
  {
    id: "colorpalette_074",
    title: "Wabi-Sabi Muted Monochromatic Earthy",
    prompt: "Severely muted almost monochromatic symphony of earthy tones — cool grey of overcast sky warm creamy white of linen and skin pale beige of weathered plaster wall and dark rich brown of hair. The palette is stripped to essence — no saturated accents no vibrancy — only the quiet dialogue between warm and cool neutrals. Subtle watermark stains on the wall add organic tonal variation. Film stock imparts a gentle desaturation that unifies all tones into a single whispered register evoking the Japanese principle of Shibui — understated restrained beauty.",
  },
  {
    id: "colorpalette_075",
    title: "Evening Street Warm Ambient Cool Shadows",
    prompt: "Warm amber-toned illumination from artificial street lighting against cool blue-grey shadows of evening urban environment. Skin tones rendered with healthy warm glow from the nearby light source. Dark street background with indistinct warm bokeh lights providing scattered color accents. The color balance sits between the warmth of artificial light and the natural coolness of twilight creating an intimate atmospheric tension. Pearl white of jewelry accessories providing subtle cool highlight accent against warm skin.",
  },
  {
    id: "colorpalette_076",
    title: "Film Urban Vibrant Desaturated Editorial",
    prompt: "Vibrant yet slightly desaturated color grade characteristic of film stock with rich color rendition. Colors feel authentic and grounded rather than digitally enhanced — the subtle desaturation adding a timeless editorial quality. Strong tonal separation between architectural elements and the subject. Warm skin tones balanced against cool urban greys and stone tones. The palette communicates sophisticated confidence — neither over-processed nor flat but sitting in the precise sweet spot of editorial film color.",
  },
  {
    id: "colorpalette_077",
    title: "SoundCloud Neon Flash Harsh Vivid",
    prompt: "High-saturation slightly cool-toned color grade with strong emphasis on bright almost artificial hues pushed by harsh flash. Colors pop in a way that feels almost synthetic and stylized — neon accents visible in bedroom environment. Skin tones slightly blown by flash creating flat high-contrast rendering. The overall palette is garish and deliberately unrefined — vibrant in the way that only cheap flash and consumer cameras produce where the color science is overwhelmed by the light source. This rawness is the aesthetic — anti-polished anti-curated proudly lo-fi.",
  },
  {
    id: "colorpalette_078",
    title: "Stark Melancholic Cool Grey-White Fog",
    prompt: "Stark melancholic color palette dominated by deep blacks of form-fitting attire contrasted by pale luminous skin and hair — all set against pervasive cool grey and white of thick atmospheric fog. The desaturated cool tones suppress warmth throughout — creating a monochromatic near-grayscale world where only the subject's skin provides contrast. The overall palette feels muted and somber — deliberate absence of warm hues reinforcing the mysterious atmospheric quality. Cool greys transition seamlessly from near-white fog to deep shadow.",
  },
  {
    id: "colorpalette_079",
    title: "Pale Blown-Out White Luminous Nostalgic",
    prompt: "Pale washed-out color palette dominated by blown-out whites and soft luminous tones. Skin tones appear pale and ethereal — pushed toward overexposure. Bright almost white light flares engulf areas of the frame creating a romanticized nostalgic warmth despite the overall paleness. The color grade is deliberately high-key — minimal dark tones with highlights pushed into pure white. The overall effect is dreamy and slightly faded — as if the image is dissolving into light itself.",
  },
  {
    id: "colorpalette_080",
    title: "Natural Unpretentious Early Digital Muted",
    prompt: "Natural unpretentious color palette characteristic of early digital photography before color grading became ubiquitous. Colors are neither enhanced nor suppressed — simply captured with the flat slightly muddled rendering of basic consumer sensors. Skin tones lack the warm glow of professional color science. The overall palette feels incidentally natural — no deliberate aesthetic choices just the honest reproduction of whatever light and color existed in the moment. Slightly muted and desaturated without being stylized.",
  },
  {
    id: "colorpalette_081",
    title: "Earthy Subdued Olive Natural Greens Indie",
    prompt: "Earthy subdued color palette dominated by olive green utility tones and natural greens accented by dark hair tones and the metallic silver of accessories. The colors are muted and slightly desaturated — nothing pops or demands attention. Natural greens of outdoor settings blend with the olive of clothing creating a cohesive earthy harmony. Subtle warm accents from jewelry glints and skin tones prevent the palette from becoming cold. The overall effect is casually cool — understated color that matches the unpretentious candid aesthetic.",
  },
  {
    id: "colorpalette_082",
    title: "Warm Creamy Neutrals Soft Muted Earth Tones",
    prompt: "Soft harmonious color palette composed of warm creamy neutrals soft creams and muted earth tones. The palette accentuates clear complexion and natural hair color creating a timeless aesthetic where nothing competes for attention. Pale tones dominate — warm whites soft beiges and subtle flesh tones creating a gentle luminous world. The clean minimalist quality of the background reinforces the palette's restraint. Overall the colors whisper rather than speak — understated elegance that feels both fresh and timeless.",
  },
  {
    id: "colorpalette_083",
    title: "Warm Golden Whites Beiges Lush Greens Summer",
    prompt: "Warm inviting color palette dominated by creamy whites and beiges bathed in the golden glow of late afternoon sun. Lush greens provide natural contrast — tree foliage and grass vibrant against the warm neutrals. The golden light infuses everything with a honeyed warmth — skin tones glow pale skin appears sun-kissed and white fabrics radiate with amber undertones. Dark hair provides the deepest tonal anchor. The overall palette evokes summer nostalgia — aspirational warmth and serene beauty in a world painted golden.",
  },
  {
    id: "colorpalette_084",
    title: "Stark White Blue Red Poolside Impact",
    prompt: "Stark impactful color palette built on bold contrasts — crisp white against cool blue water accented by a rich red drink that provides the singular warm pop. Deep brown hair and dark sunglasses anchor the cool tones while pale skin bridges the contrast between white and blue. The high-contrast slightly desaturated processing pulls back the vibrancy just enough to feel editorial rather than casual. The overall palette is clean geometric and intentional — minimal colors deployed for maximum graphic impact.",
  },
  {
    id: "colorpalette_085",
    title: "Natural Wood Gold Floral White Refined",
    prompt: "Natural refined color palette dominated by warm polished wood tones accented by rich gold and subtle floral hues of painted decorative designs. Crisp white of the backdrop provides clean neutral contrast — earthy browns of a wooden display frame ground the warm spectrum. The true-to-life color rendering preserves every subtle tonal variation — the honey amber of aged wood the warm glint of gold leaf the delicate pinks and greens of hand-painted florals. The overall palette is elegant and historically resonant — warm natural materials rendered with documentary precision.",
  },
  {
    id: "colorpalette_086",
    title: "Warm Rich Brown White Vibrant Green Gold",
    prompt: "Warm and rich color palette dominated by cozy brown tones and soft whites — sharply punctuated by vibrant greens and golden light — a muted warm-toned filter softening the overall intensity creating an almost dreamy intimate aspirational feel with a blend of earthy comfort and vivid color accents.",
  },
  {
    id: "colorpalette_087",
    title: "Natural Earthy Brown Green Muted Nostalgic",
    prompt: "Natural and earthy color palette dominated by warm browns and dirt tones — muted greens of foliage in the background — casual blues and whites of everyday clothing — slightly muted saturation making the scene feel a touch less vibrant than real life adding to a nostalgic quality.",
  },
  {
    id: "colorpalette_088",
    title: "Deep Faded Black Rich Green Pale Contrast",
    prompt: "Color palette dominated by deep almost faded black and rich natural greens of foliage — contrasted by pale skin tones and dark hair — captured with slightly muted saturation creating a raw unenhanced naturalistic grade.",
  },
  {
    id: "colorpalette_089",
    title: "Bright Fresh Bleached White Dark Hair Rosy",
    prompt: "Bright and fresh color palette dominated by crisp almost bleached white clothing which appears even brighter due to overexposure settings — contrasting sharply with long dark voluminous wavy hair and full rosy lips — background warm tones slightly desaturated further emphasizing the subject's vibrancy — optimized for digital consumption.",
  },
  {
    id: "colorpalette_090",
    title: "Slightly Desaturated Cool Stark Gritty",
    prompt: "Slightly desaturated cool color palette with stark contrast — deep pronounced shadows and strong highlights creating a gritty unidealized tonal range — cool cast contributing to a melancholic rebellious atmosphere.",
  },
  {
    id: "colorpalette_091",
    title: "Classic Black White Tweed Patent Light Wood",
    prompt: "Classic elegant color palette featuring timeless black and white tweed — crisp white of skirt and accessories — patent black of shoes and handbag — set against a clean modern interior with neutral walls and light wood flooring — sophisticated and refined.",
  },
  {
    id: "colorpalette_092",
    title: "Light Pink White Green Beige Maroon Floral",
    prompt: "Light pink of clothing contrasting with vibrant pink and white flower petals — green stems creating lush natural tones — neutral beige background — deep maroon nail accents — a delicate romantic palette dominated by soft florals and warm neutrals.",
  },
  {
    id: "colorpalette_093",
    title: "Black Dress Silver Pearl City Muted",
    prompt: "Black dress as dominant tone — silver necklace and matching earrings — metallic blue nail polish accent — white building and dark metallic surfaces in background — muted urban palette with precious metal highlights adding understated sophistication.",
  },
  {
    id: "colorpalette_094",
    title: "Neutral Beige White Light Wood Gold Tweed",
    prompt: "Neutral tones of beige white and light wood — brown tweed with dark green and black plaid hues — olive-green tote bag accent — golden glow from decorative elements — a calm organized palette that blends warm wood tones with earthy plaid and metallic warmth.",
  },
  {
    id: "colorpalette_095",
    title: "Stark Contrasts Glowing White Deep Black Metallic",
    prompt: "Stark contrasts of glowing whites deep blacks and muted green-browns against washed-out beige — sharp metallic accents sparking on glasses and hardware — the palette sharpens under flash erasing warm tones and replacing them with cold gritty contrasts — electric and aggressive tonal range.",
  },
  {
    id: "colorpalette_096",
    title: "Cool Desaturated Pastel Synthetic Baby-Girl",
    prompt: "Cool desaturated realism around 4600K — pastel shades with synthetic shine — muted peach or soft baby pink tones — glossy finish contrasted with soft vulnerable textures — blown-out whites with minimal color variation in the background — cool cast creating an eerie doll-like palette.",
  },
  {
    id: "colorpalette_097",
    title: "Pastel Cloud Blue Warm Cream Antique Rose",
    prompt: "Pastel shades of cloud blue warm cream and antique rose — soft muted tones that feel tender and intimate — warm golden glow from a lamp adding honey warmth — nothing harsh or vivid — all colors whisper rather than speak — the palette of a bedroom at dusk.",
  },
  {
    id: "colorpalette_098",
    title: "Clean White Warm Neutral Cream Quiet Wealth",
    prompt: "Clean whites and warm neutrals speaking to quiet wealth — creamy textures and tonal palette of bone cream and warm neutral tones — old money restraint in color choices — nothing loud or attention-seeking — the palette of understated luxury that assumes rather than announces.",
  },
  {
    id: "colorpalette_099",
    title: "Warm Oat Milk Beige Antique White Blush Ivory",
    prompt: "Warm oat milk beige antique white and blush ivory as base — muted pistachio from tea elements and deep honey accents — sheer steam adding ethereal quality — warm ceramic tones — everything in the warm neutral spectrum with subtle natural accents of green and gold.",
  },
  {
    id: "colorpalette_100",
    title: "Warm Neutrals Candlelight Cream Dusty Blush Antique Gold",
    prompt: "Warm neutrals of candlelight cream dusty blush faded peach and antique gold — cool accents of bone soft gold and smoke — pops of pink-toned lip balm white mug or vintage blue detail — soft contrast of velvet black with creamy white — everything warm burnished and golden with morning intimacy.",
  },
];

export const Texture = [
  {
    id: "texture_001",
    title: "Liquid Drape Tactile Richness",
    prompt: "Silk pooling on polished floors with liquid drape and subtle sheen catching light in waves creating sense of luxury and fluidity. Embroidery catching late sun with intricate threadwork visible. Smooth cottons brushed cashmere manicured grass all creating tactile richness",
  },
  {
    id: "texture_002",
    title: "Porcelain Glaze Radiates",
    prompt: "Cashmere against skin showing soft pile and gentle texture that invites touch while suggesting quality and comfort. Texture radiates from every element glowing skin fine porcelain glaze",
  },
  {
    id: "texture_003",
    title: "Candle Wax Texture-Driven",
    prompt: "Eyelet lace with intricate cutwork patterns creating delicate interplay of solid and void feminine and architectural. Chiffon fluttering by breeze. Candle wax glow on skin. Raw silk weathered wood delicate skin texture-driven composition",
  },
  {
    id: "texture_004",
    title: "Braille Crushed Tulle Floats",
    prompt: "Sequins partially hidden under mohair cardigan creating subtle shimmer. Micro-beading that looks like condensation. Embroidery so dense it feels like braille. Linen worn down to softness like pages of loved book. Velvet with worn edges and uneven dye. Crushed tulle layered so thick it floats",
  },
  {
    id: "texture_005",
    title: "Heritage Luxury Handcrafted",
    prompt: "Chunky cable-knit sweaters with visible texture and dimensional weave - soft worn leather with natural patina - brass hardware with aged finish showing character - wicker basket weave with organic irregularities - natural linen with subtle slubs creating authentic handcrafted quality - all contributing to heritage luxury aesthetic",
  },
  {
    id: "texture_006",
    title: "Hyper-Realistic Tangible Immediate",
    prompt: "Intricate Natural Micro-Details: Every crack in weathered rock surface revealing mineral composition - tiny moss leaves and lichen patterns with incredible sharpness - delicate flower petals showing translucent edges and fine veining - varied surfaces from rough stone to soft organic growth - dewdrops clinging to surfaces catching light - tactile richness inviting viewer to reach out and touch - hyper-realistic rendering making scene tangible and immediate",
  },
  {
    id: "texture_007",
    title: "Raw Un-Beautified Skin Flash Impact",
    prompt: "Skin tones raw and unfiltered - skin tones should be rendered with a raw un-beautified quality showing natural imperfections and the direct impact of the flash avoiding any overly warm or soft appearance.",
  },
  {
    id: "texture_008",
    title: "Layered Fabrics Metal Film Tangible",
    prompt: "Heightened tactile sensation sensory richness - render all textures with exceptional almost tangible fidelity - soft outerwear fabrics fine ribbing of knits subtle denim texture the sleekness of hair and the subtle glint of metal details - these textures from smooth skin to fabric weave are rendered with a tactile precision by the film and lens that transcends casual observation inviting a closer more appreciative gaze that accentuates the sensory richness of the scene.",
  },
  {
    id: "texture_009",
    title: "Micro-Contrast Skin Radiant Authenticity",
    prompt: "Micro-contrast and skin tone fidelity radiant authenticity - the subject's face should exhibit exceptional micro-contrast and resolution rendering her skin with a natural luminous quality rich in subtle healthy undertones warm peaches cool rosy hues avoiding any plastic or overly smoothed appearance - this high fidelity to natural skin texture a hallmark of professional sensors makes her feel authentic radiant and approachable despite the aspirational setting.",
  },
  {
    id: "texture_010",
    title: "Silky Hair Soft Elements Intimate",
    prompt: "Heightened tactile sensation sensory richness - render all textures with exceptional almost tangible fidelity - smooth delicate skin long silky strands of hair soft foreground elements and subtle background details should all be viscerally tangible and highly detailed where in focus - this tactile richness is what truly elevates the image making it an experience rather than just a visual drawing the viewer into a serene and intimate world in a way the human eye without photographic enhancement would struggle to achieve.",
  },
  {
    id: "texture_011",
    title: "Flowing Fabric Vibrant Surfaces Playful",
    prompt: "Heightened tactile sensation playful richness - render all textures with exceptional fidelity - light flowing fabrics smooth colorful surfaces and intricate environmental graphics the subtle sheen of hair and the texture of skin should all be viscerally tangible and highly detailed showcasing the transformative capabilities of a high-resolution sensor and sharp lens - this tactile richness makes the playful vibrant environment feel immersive and real a depth of detail often enhanced by the photographic process drawing the viewer into the scene.",
  },
  {
    id: "texture_012",
    title: "Beadwork Embellishment Polished Grandeur",
    prompt: "Heightened tactile sensation tangible grandeur - render all textures with exceptional almost tangible fidelity - delicate shimmering beadwork and fine fabrics the smooth dark sheen of hair polished cool architectural surfaces and the subtle gleam of jewelry should all be viscerally tangible and highly detailed showcasing the transformative capabilities of a high-resolution sensor and a critically sharp lens - this tactile richness is what truly elevates the image making it an experience rather than just a visual drawing the viewer into the luxurious environment and the exquisite details of attire in a way the human eye without photographic enhancement would struggle to achieve.",
  },
  {
    id: "texture_013",
    title: "Forensic Skin Pore-Level Realism",
    prompt: "Render all human surfaces with forensic-grade biological fidelity at a level that reveals plausible non-repeating real-world texture at extreme magnification. Skin exhibits a complete stochastic pore map with size variation from larger visible pores around the nose and cheek centers to fine barely-visible pores along the forehead and jawline — each pore casts its own micro-shadow and high-frequency micro-contrast reveals subsurface scattering breaking around individual skin structures. Hair rendered as individually distinct physical fibers — eyebrow hairs vary in thickness length and transparency with occasional rogue strands each emerging from a darker root point — eyelashes cluster in natural groups of three to five rather than uniform fringes with micro-scales along each lash catching light. Flyaway hairs backlit by the scene's key light create a luminous halo each strand showing natural wave or kink. Eyes modeled as moist multi-layered biological organs — iris fibers radiate with varying density overlaid with fractal mesh patterns — scleral whites carry microscopic vascular tinting with subtle thread-like blood vessels — corneal surface shows complex environmental reflections and a visible tear line along the lower eyelid. Skin specularity follows a physically-based selective map with soft highlights on forehead nose bridge and cheekbones and zero shine in hollows — subsurface scattering transmits warm red-glow through thin cartilage at ears nostrils and cheeks. Fine colorless sensor grain and microscopic chromatic aberration fringing on high-contrast edges complete the biological authenticity — the result must feel like a forensic-quality document of genuine human texture captured by a high-resolution professional system rather than any form of digital generation or retouching.",
  },
  {
    id: "texture_014",
    title: "Gothic Architecture Wet Cobblestone",
    prompt: "Textures rendered with exceptional fidelity emphasizing nighttime architectural grandeur — intricate stone carvings and soaring spires rendered with dramatic sharpness and tangible detail — rough wet cobblestones of the pavement with visible grain and reflective wet surfaces creating mirror-like pools of light — subtle details of the subject's clothing viscerally tangible against the monumental backdrop — this heightened textural richness far beyond what the eye might quickly process at night immerses the viewer in the scene's grandeur and the tactile reality of the environment",
  },
  {
    id: "texture_015",
    title: "Translucent Petals Dress Weave Film",
    prompt: "Heightened tactile sensation with sensory richness — render all textures with exceptional almost tactile fidelity — the subtle weave of a black dress the delicate almost translucent petals of an oversized white flower with its vibrant yellow center the soft strands of hair and the gentle blush on cheeks should all be viscerally tangible and highly detailed. The film's ability to capture minute textures especially the softness of flower petals and subtle imperfections of skin creates a sensory richness that makes the image profoundly immersive and emotionally engaging — a depth of feeling that goes beyond mere visual representation.",
  },
  {
    id: "texture_016",
    title: "Cozy Knit Fur Fireplace Tactile",
    prompt: "Heightened tactile sensation with engaging softness — render all textures with exceptional almost tangible fidelity — soft chunky knit of a sweater the delicate weave of a top delicate fluffy cat fur with individual strands and hairs discernible smooth skin with natural luminous quality rough stacked stone of a fireplace the smooth surface of a TV soft rumpled linen bedding flowing sun-kissed hair strands and polished decor surfaces should all be viscerally tangible and highly detailed. Each individual hair on a cat's face and body should be discernible creating a visceral sense of touch and enhancing the feeling of warmth and comfort. This tactile richness showcasing the transformative capabilities of a high-resolution sensor and sharp lens makes the scene feel incredibly immersive and engaging — inviting the viewer to almost feel the softness and warmth — a depth of detail often enhanced by the photographic process.",
  },
  {
    id: "texture_017",
    title: "Professional Workspace Materials Tactile",
    prompt: "Heightened tactile sensation with professional sensory richness — render all textures with tangible precise fidelity — subtle wrinkles in a linen-like shirt the smooth finish of a laptop the delicate texture of notebook paper the precise lines of a fountain pen the crisp lines of handwriting on paper the grain of a whiteboard surface and rattan elements should all be viscerally tangible and highly detailed. Hair strands rendered with high acutance and individual clarity. Fabric weave and clothing folds captured with precise micro-contrast — every strand of hair subtle folds of clothing and crisp lines of writing rendered with a fidelity that elevates the scene beyond a simple snapshot communicating intelligence and diligence. The micro-detail on workspace objects — keyboard keys pen barrels paper edges whiteboard marker tips — communicates the tactile reality of focused work. This textural richness grounds the image in relatable reality while elevating its visual quality inviting a closer more appreciative gaze into her productive world — a captured moment of intelligent creation.",
  },
  {
    id: "texture_018",
    title: "Whiteboard Denim Skin Material Physics",
    prompt: "Heightened material physics rendering — whiteboard semi-gloss surface showing legible text despite viewing angle. Denim rendered with micro-contrast of warp and weft texture. Skin showing subsurface scattering with natural tone retention. Marker with plastic specularity and saturated pigment deposition. Dark matte-finish fabric top emphasizing clean lines avoiding distracting reflections. Medium-toned trouser texture providing visual separation. All surfaces communicating focused clarity through physically accurate material interaction rendering.",
  },
  {
    id: "texture_019",
    title: "Smartphone Computational Uniform Sharpness",
    prompt: "Heightened computational texture clarity — every detail rendered crisper than real life with extreme uniform sharpness. Individual laptop keys visible. Weave of cotton shirt captured with thread-level detail. Pattern of bedsheets rendered with precise geometry. White curtain texture fully preserved despite bright window behind. Soft inviting weave of couch fabric the comfortable slightly worn texture of sweatshirt and sweatpants the subtle texture of throw pillows and sleek laptop surface all captured with clarity that invites comfort and presence. The sharpness on laptop screen interface adds authenticity of engagement.",
  },
  {
    id: "texture_020",
    title: "Ancient Stone Mosaic Linen Heritage",
    prompt: "Heightened tactile sensation with historical richness — render all textures with exceptional almost tangible fidelity. Crisp yet soft linen of outfit. Rough weathered surface of ancient stone wall with deep textural detail. Intricate shimmering tiles of mosaic. Woven straw of basket. Phenomenal micro-contrast and rich tonal gradation revealing palpable texture and depth in stone and mosaic — light playing across varied surfaces making them feel more tactile and historically resonant than direct observation. This tactile richness makes the image an experience drawing the viewer into the luxurious historic environment.",
  },
  {
    id: "texture_021",
    title: "Natural Foliage Garment Petal Organic",
    prompt: "Heightened tactile sensation with organic fidelity — soft weave of elegant garment smooth sheen of neatly tied hair delicate texture of skin individual petals and veins of flowers and varied textures of lush green foliage all viscerally tangible and highly detailed. Medium format sensor capturing nuanced textures that contribute to sensory richness. The tactile detail invites the viewer into the moment of natural elegance — surfaces feel palpably rich and refined.",
  },
  {
    id: "texture_022",
    title: "Hammock Woven Fiber Skin Leaf Detail",
    prompt: "Heightened tactile sensation creating visceral connection — rough woven fibers of hammock rendered with intricate weave detail. Smooth delicate texture of skin. Individual leaves of surrounding trees. Film's unique ability to render fine details with aesthetic quality — the intricate detail of hammock weave is heightened by film grain creating organic textural fusion. This makes the image feel incredibly present and real yet imbued with a dreamy quality that transcends mere observation.",
  },
  {
    id: "texture_023",
    title: "Tree Bark Flowing Dress Ancient Natural",
    prompt: "Heightened tactile sensation with ancient nature richness — rough ancient bark of tree rendered with deep crevice detail. Delicate flowing fabric of white dress. Individual strands of hair. Subtle ripples on distant water. All surfaces viscerally tangible showcasing the transformative capabilities of high-resolution sensor and characterful vintage lens. The ancient tree feels alive and the delicate human presence profoundly real within it.",
  },
  {
    id: "texture_024",
    title: "Film Grass Skin Hair Dreamy Organic",
    prompt: "Heightened tactile sensation with organic film fidelity infused with subtle film grain — soft strands of flowing hair delicate texture of skin gentle creases of white dress and individual blades of grass all viscerally tangible yet rendered with the unique character of medium format film grain. This tactile richness combined with ethereal light and color creates an immersive experience drawing the viewer into a serene beautiful world that feels deeply personal and exquisitely photographic.",
  },
  {
    id: "texture_025",
    title: "Vintage Dress Wind Hair Dry Grass",
    prompt: "Enhanced tactile sensation with visceral detail — intricate floral pattern and delicate lace details of vintage-style dress. Wild wind-swept waves of long blonde hair with individual strands discernible. Varied rustic textures of tall dried grasses. All rendered with exceptional almost tangible fidelity — making the viewer almost feel the fabric and smell the dry grass — sensory details amplified by the photographic medium.",
  },
  {
    id: "texture_026",
    title: "Lace Fan Pearl Period Garment",
    prompt: "Heightened tactile sensation with historical richness — intricate lace and delicate ruffles of white blouse. Delicate weave of antique fan. Smooth pearls. Subtle texture of skin and hair. All viscerally tangible and highly detailed — historical garments and accessories feeling incredibly real and luxurious — a depth of textural capture significantly surpassing natural observation.",
  },
  {
    id: "texture_027",
    title: "Rose Kraft Paper Knit Sweater Hat",
    prompt: "Heightened tactile sensation with sensory richness — soft fine knit of sweater and hat. Delicate petals of roses. Rough natural texture of kraft paper wrapping. Smooth strands of hair. All viscerally tangible and highly detailed — making the fashion feel real and accessible drawing the viewer into the luxurious world of high fashion with enhanced clarity that transcends casual observation.",
  },
  {
    id: "texture_028",
    title: "Fur Coat Skin Hair Organic Depth",
    prompt: "Heightened tactile sensation with naturalistic depth — soft luxurious texture of fur coat with individual fibers discernible. Natural radiant skin with subtle specular highlights on cheekbones. Strands of hair and individual fiber details of fur. All textures rendered with organic fidelity characteristic of medium format film — inviting the viewer to almost feel the luxury of the fabrics and the warmth of the scene.",
  },
  {
    id: "texture_029",
    title: "Soaked Dress Sea Foam Windswept Hair",
    prompt: "Hyper-realistic texture and visceral immersion — crashing waves with frothy sea foam rendered with intricate patterns. Windswept hair with individual strands rendered with photographic precision. Soaked clinging white dress fabric. Subtle skin contours. All textures captured with medium format fidelity far beyond casual human vision creating visceral sense of immersion making elements feel almost tangible.",
  },
  {
    id: "texture_030",
    title: "Lace Gloves Wool Coat Mountain Rock Water",
    prompt: "Heightened sensory richness — soft intricate lace of gloves. Plush wool of coat. Smooth fabric of dress. Rough ancient rock of mountains. Subtle ripples on water surface. Film emulsion capturing nuanced textures contributing to immersive sensory richness — making the viewer feel almost present in the crisp mountain air.",
  },
  {
    id: "texture_031",
    title: "Delicate Dress Hair Cloud Square Format",
    prompt: "Heightened tactile sensation with softly defined fidelity — delicate flowing fabric of dress. Subtle strands of blonde hair. Fluffy voluminous texture of clouds. All rendered with exceptional yet softly defined detail characteristic of medium format film — showcasing nuanced textures that contribute to sensory richness and nostalgic feel.",
  },
  {
    id: "texture_032",
    title: "Patchwork Scarf Grass Bohemian Layers",
    prompt: "Heightened tactile sensation with tangible fashion richness — intricate patchwork and crochet of top. Rich woven texture of striped scarf. Individual blades of grass. All viscerally tangible and highly detailed — film emulsion and sharp lens capturing textures with unique organic feel. Fine visible film grain further enhancing tactile quality — immersing the viewer in the sensory experience.",
  },
  {
    id: "texture_033",
    title: "Daisy Petals Clothing Hair Summer",
    prompt: "Heightened tactile sensation with sensory delight — delicate petals of daisies. Soft fabric of clothing. Subtle movement in hair from breeze. Bright blue sky rendered with depth and clarity. All viscerally tangible and highly detailed — high-resolution film scan and sharp lens making the image an experience drawing the viewer into sensory richness of a summer field.",
  },
  {
    id: "texture_034",
    title: "Forest Grass Hair Tree Bark Portra",
    prompt: "Heightened sensory immersion — soft dry blades of grass rendered with individual detail. Subtle textures of tree bark in background. Flowing hair with strand-level resolution. All viscerally tangible and highly detailed — medium format film and critically sharp lens making the natural environment feel immersive and deeply real. Portra film grain adding organic textural layer.",
  },
  {
    id: "texture_035",
    title: "Book Pages Watch Metal Fan Wood Cabin",
    prompt: "Heightened sensory richness with remarkable fidelity — crinkle of book pages. Subtle sheen of watch. Smooth wood of table. Plastic of fan. Subtle texture of skin. All viscerally tangible and highly detailed — making the act of reading feel almost palpable and the compact environment incredibly real. Camera lens enhancing sensory depth beyond casual observation.",
  },
  {
    id: "texture_036",
    title: "Hoodie Worn Fabric Watch Urban Intimate",
    prompt: "Heightened tactile sensation with tangible comfort — soft worn cotton of hoodie. Intricate details of watch face and strap. Texture of hair. Subtle lines on hands. All viscerally palpable and highly detailed — high-resolution sensor and critically sharp lens making the image feel incredibly real and intimate drawing the viewer to appreciate attire quality and emotional depth.",
  },
  {
    id: "texture_037",
    title: "Hair Lace Camisole Glossy Selfie",
    prompt: "Heightened tactile sensation with raw authenticity — smooth sheen of long dark hair. Delicate lace of camisole. Subtle texture of skin preserved with micro-imperfections. Lustrous material of yellow top. All viscerally tangible and highly detailed — raw textural detail unsoftened by heavy beauty filters crucial for the unfiltered authentic aesthetic.",
  },
  {
    id: "texture_038",
    title: "Slip Dress Lace Trim Flowing Hair Runway",
    prompt: "Heightened tactile sensation with fabric and hair richness — delicate flowing fabric of slip dress. Intricate patterns of lace trim. Soft voluminous strands of hair. All viscerally tangible and highly detailed — film capturing subtle textures with unique organic quality. The softness of fabric and movement in hair making the image an experience beyond casual observation — delicate details of ensemble and natural beauty feeling almost palpable.",
  },
  {
    id: "texture_039",
    title: "Floral Dress Wet Hair Glass Garden",
    prompt: "Heightened sensory immersion — intricate embroidery and delicate fabric of floral dress. Wet strands of hair. Individual blades of grass. Condensation on glass. All viscerally palpable and highly detailed — medium format film resolution making the image an immersive sensory experience. Tactile richness drawing the viewer into the scene with depth of perception transcending real-life casual observation.",
  },
  {
    id: "texture_040",
    title: "Steam Water Tiles Cabin Spa Tangible",
    prompt: "Tangible steam and water rendered with sensory richness — delicate steam tendrils rising to thicker clouds with incredible ethereal detail. Water showing subtle ripples and reflections feeling physically tangible. Hot tub tile textures. Cabin stone facade. Snow on distant trees. All rendered with crisp natural detail grounding the scene in its natural luxurious setting.",
  },
  {
    id: "texture_041",
    title: "Horse Fur Floral Dress Dark Hair Pastoral",
    prompt: "Heightened tactile sensation beyond sight — silky strands of dark hair. Delicate flowing fabric of floral dress. Soft textured fur of horse's back. Subtle variations in distant foliage. All viscerally palpable and highly detailed — making the image an experience drawing the viewer into the scene's delicate beauty in ways the human eye without photographic enhancement would struggle to achieve.",
  },
  {
    id: "texture_042",
    title: "Slip Dress Cushion Rug Swing Couch",
    prompt: "Heightened tactile sensation with comfort and softness — soft light fabric of slip dress. Plush white cushions. Slightly weathered wood of swing couch. Intricate pattern of outdoor rug. All viscerally tangible and highly detailed — making the scene feel incredibly inviting and comfortable drawing the viewer into a moment of peaceful repose.",
  },
  {
    id: "texture_043",
    title: "Flower Petals Dry Grass Skin Hair Sun",
    prompt: "Heightened sensory immersion — delicate flower petals. Rough texture of dry grass. Smooth softness of skin. Subtle strands of hair. All viscerally tangible and highly detailed — high-resolution sensor and critically sharp lens making the image an immersive experience drawing the viewer into the moment of natural repose.",
  },
  {
    id: "texture_044",
    title: "Wildflower Petals Grass Hair Folkloric",
    prompt: "Heightened sensory immersion with softly rendered fidelity — delicate petals of white and blue wildflowers. Individual blades of grass. Flowing strands of hair. All viscerally tangible yet softly rendered by the lens creating tactile sensation that draws the viewer into the sensory experience of the meadow — micro-detail combined with soft focus creating immersive realism that feels both present and dreamlike.",
  },
  {
    id: "texture_045",
    title: "Gravel Path Dress Basket Leaves Forest",
    prompt: "Heightened sensory richness — rough gravel of path. Soft fabric of dress. Wicker of basket. Varied leaves of trees. All viscerally tangible and richly detailed — film capturing texture with unique organic feel. Subtle film grain imperfections further enhancing tactile quality inviting the viewer into the sensory experience of the moment.",
  },
  {
    id: "texture_046",
    title: "Flower Crown Hair Skin Smoke Ethereal",
    prompt: "Heightened tactile sensation beyond sight — delicate petals of flower crown. Subtle texture of long flowing hair. Smooth appearance of skin. Faint wisps of smoke. All viscerally tangible and highly detailed — drawing the viewer into an intimate contemplative world. The softness of hair and delicacy of petals making the image an experience rather than just a visual.",
  },
  {
    id: "texture_047",
    title: "Lavender Blossom Wavy Hair Freckle Skin",
    prompt: "Heightened delicate beauty — intricate details of lavender blossoms. Soft strands of wavy hair. Subtle texture of skin with visible freckles. Distant foliage rendered with gentle softness. All viscerally tangible yet gently softened by lens and light — making the image feel incredibly intimate and beautiful.",
  },
  {
    id: "texture_048",
    title: "Snow Outfit Hair Kawaii Crisp Detail",
    prompt: "Heightened tactile energy — crisp texture of snow with subtle depth detail. Vibrant fabric of pink outfit. Flying strands of hair caught mid-motion. All rendered with energetic crisp clarity — noticeable digital sharpening giving elements a defined pop. Despite high-key brightness textures remain discernible adding to the joyful immersive quality.",
  },
  {
    id: "texture_049",
    title: "Frozen Snow Particles Visceral Winter",
    prompt: "Exceptional almost visceral fidelity — individual flying snow particles visible with unique shapes frozen in mid-air a photographic feat beyond human vision. Soft fuzzy texture of sweater feeling tangible. Coarse glistening quality of packed snow on ground palpable. Rich warm auburn hair strands caught mid-flight. This tactile richness particularly the exaggerated visibility of individual snowflakes makes the viewer feel truly immersed in cold exhilarating environment.",
  },
  {
    id: "texture_050",
    title: "Kawaii Fluffy Snow Stylized Softness",
    prompt: "Mix of realism and stylized softness — fluffy almost cartoonish texture of fur and boots. Individual sparkling snow particles viscerally tangible yet visually softened by overall aesthetic enhancing feeling of cozy cuteness and playful tactile sensation. Snow itself looking incredibly soft and inviting — texture often made more appealing through photographic enhancement. Overall textures heightened yet smoothed by beauty filter processing.",
  },
  {
    id: "texture_051",
    title: "Film Grain Organic Wildflower Pastoral",
    prompt: "Subtle organic pleasing film grain throughout adding tactile texture and immediate sense of authenticity — softening edges imparting timeless quality. Selective focus creating creamy natural bokeh gently blurring foreground wildflowers. Rich golden wildflower petals with depth and dimension. Soft strands of blonde hair with dreamy radiance. White cotton tank top retaining subtle texture. Dog fur with natural warmth and softness. All rendered with gentle organic quality characteristic of Portra film — never sterile or digitally harsh.",
  },
  {
    id: "texture_052",
    title: "Point-and-Shoot Film Soft Dreamy Grain",
    prompt: "Fine organic noticeable film grain across entire image — beautiful textural structure of film emulsion not digital noise. Overall softness and subtle optical blur creating consistent gentle diffusion across subject. Highlights exhibiting subtle glow or halation where bright areas bleed into surrounding tones. Mountain grass and wildflowers rendered with soft organic quality. Hair and clothing have gentle tactile feel softened by inherent lens character. All textures slightly romanticized by the analog process.",
  },
  {
    id: "texture_053",
    title: "High-Fashion Tactile Elegance Detail",
    prompt: "Exceptional almost tactile fidelity — soft strands of blonde hair with individual strand visibility. Smooth skin texture with natural luminous quality. Fine knit of turtleneck with discernible weave pattern. Polished metal of earrings with rich almost tangible gleam and subtle tonal variations highlighting metallic quality. All textures viscerally tangible and highly detailed showcasing transformative capabilities of high-resolution sensor and critically sharp lens — tactile richness elevating luxurious details to feel present and real.",
  },
  {
    id: "texture_054",
    title: "Beauty Portrait Silky Waves Luminous Skin",
    prompt: "Exceptional almost tangible fidelity — silky waves of hair with each strand catching light. Subtle skin texture retaining natural pores and fine lines while appearing luminous and perfected. Soft fabric of top with gentle drape. All rendered with resolution and micro-contrast characteristic of high-end medium format or full-frame capture — tactile richness making beauty feel real and inviting with depth of detail profoundly enhanced by the photographic process.",
  },
  {
    id: "texture_055",
    title: "Wilderness Plaid Stone River Filmic Tactile",
    prompt: "Exceptional almost tangible fidelity — soft intricate weave of plaid fabric with visible pattern detail. Delicate strands of curly hair catching light. Smooth yet varied surfaces of river stones with natural tonal variation. Rough bark of distant trees. Subtle ripple of water with reflected light. All textures viscerally felt through the image — level of detail and tactile richness profoundly enhanced by medium format film process with subtle Portra grain adding skin-like texture to entire frame.",
  },
  {
    id: "texture_056",
    title: "Vintage Film Sheer Fabric Nostalgic Grain",
    prompt: "Unique filmic textural quality — soft sheer fabric of dress with delicate floral appliques visible through grain. Smooth slightly worn floor surface. Subtle texture of socks with gentle knit pattern. Natural hair strands with soft romantic quality. All textures possess gentle tactile quality enhanced by film grain making them feel soft delicate and contributing to vulnerability — camera makes textures feel almost touchable in a nostalgic way rather than clinically sharp.",
  },
  {
    id: "texture_057",
    title: "Polar Snow Ice Crystalline Pristine",
    prompt: "Exceptional almost tangible fidelity — powdery crystalline texture of snow including subtle footprints and drift patterns. Smooth gloss of jacket with reflective quality. Soft knit of beanie with visible fiber texture. Delicate strands of hair catching polar light. Ice crystals with subtle sparkle. All textures rendered to make viewer feel the cold of snow and softness of attire — immersive quality going beyond casual observation creating almost felt sense of environment and presence.",
  },
  {
    id: "texture_058",
    title: "Luxury Fabric Surface Exaggerated Tactile",
    prompt: "Exaggerated tactile sensation going far beyond visual — every texture from delicate weave of silk pajamas to intricate carvings of antique furniture to crispness of linen and subtle sheen of polished surfaces rendered with almost palpable richness. Heightened textural fidelity direct result of high-resolution medium format sensor and critically sharp lens creating immersive experience where luxury is felt not just seen. Finest thread of fabric to subtlest gleam on polished surface captured with surgical precision and palpable tactile quality.",
  },
  {
    id: "texture_059",
    title: "Linen Plaster Grain Wabi-Sabi Imperfection",
    prompt: "Exquisite tangible texture of linen fabric on the shoulder in critical focus — every fiber and weave visible. Weathered plaster wall with subtle watermarks stains and ghosts of old paint adding organic patina. Fine hairs on skin illuminated by window light. Cracked window pane with its web of fracture lines. Organic 35mm film grain layered over all surfaces — the grain itself becoming a textural element that unifies the scene. Everything dissolves into soft grainy blur beyond the shallow focal plane creating a powerful contrast between critical sharpness and dreamy dissolution.",
  },
  {
    id: "texture_060",
    title: "Hair Pearls Fabric Smartphone Evening",
    prompt: "Long hair showing soft texture catching ambient evening light. Smooth fabric of top contrasting with the delicate textured pearls of bracelet — the interplay between matte and lustrous surfaces. Skin rendered with natural smartphone softness — neither overly sharp nor artificially smoothed. The low-light conditions add subtle grain that softens all textures into a cohesive intimate register. Background bokeh lights as soft circular shapes providing textural depth to the out-of-focus areas.",
  },
  {
    id: "texture_061",
    title: "Film Grain Architectural Gate Urban",
    prompt: "Subtle film grain adding warmth and tactile richness to all surfaces. Architectural textures of iron gate and stone wall rendered with natural detail. Hair and fabric catching bright daylight with visible sheen and dimension. Background building discernible but softly blurred — enough texture to read as urban environment. The film rendering gives all surfaces a slight organic quality that feels more tangible and present than digital capture.",
  },
  {
    id: "texture_062",
    title: "Form-Fitting Fabric Skin Metal Atmospheric",
    prompt: "Smooth figure-hugging fabric clinging to form with subtle sheen where light catches the surface — the tight weave revealing body contours beneath. Pale skin rendered with luminous delicate quality against dark fabric. Textured metal rendered with industrial tactile presence — the cool roughness contrasting sharply with soft organic surfaces. Delicate hands with fine detail visible. The fog-diffused light softens all textures slightly giving everything a slightly ethereal quality.",
  },
  {
    id: "texture_063",
    title: "Soft Hair Cat Fur Fabric Intimate Dreamlike",
    prompt: "Soft texture of hair rendered with luminous sheen and gentle flow. Indistinct soft fur of an animal blurred by shallow focus into a warm fuzzy presence — tactile and inviting even without sharp detail. Smooth fabric of clothing with subtle drape and gentle highlights. The soft-focus filter diffuses all textures slightly — creating a dreamlike quality where surfaces are felt rather than seen with precision. The intimate tactile richness invites the viewer to imagine touching rather than just observing.",
  },
  {
    id: "texture_064",
    title: "Rugged Fabric Metal Camera Accessories Indie",
    prompt: "Rugged utility fabric of a dress with visible weave and natural drape — workwear texture that reads as practical and authentic. Smooth polished metal of a camera body catching ambient light with a cool subtle glint. Delicate accessories and jewelry adding fine metallic detail. The raw image quality softens textures slightly — nothing is rendered with razor precision which adds to the candid unstudied feel. The contrast between rugged fabric and polished metal creates tactile interest.",
  },
  {
    id: "texture_065",
    title: "Smooth Fabric Cold Metal Jewelry Moody",
    prompt: "Smooth fabric of clothing rendered with soft drape and gentle highlights. Cold metal surfaces captured with a distinct weight and solidity — the smooth hardness creating tactile contrast against soft organic textures. Subtle jewelry details with delicate metallic sheen. Skin rendered with natural luminosity in the moody directional light. The crisp smartphone rendering captures surface details with clarity — fabric folds metal edges and skin texture all visible without being over-sharpened.",
  },
  {
    id: "texture_066",
    title: "Flowing Dress Leather Seats Foliage Summer",
    prompt: "Smooth flowing fabric of a light dress with gentle drape and movement — the material catching golden light with warm luminous folds. Soft leather of car seats with supple worn texture suggesting warmth and comfort. Lush foliage textures rendered with rich green depth — leaves and branches softly blurred into organic bokeh. Delicate hair strands catching backlighting with individual strand detail visible against the warm glow. The shallow depth of field renders foreground textures sharply while background textures dissolve into dreamy impressionistic softness.",
  },
  {
    id: "texture_067",
    title: "Wet Skin Sleek Swimsuit Reflective Water Poolside",
    prompt: "Smooth wet skin rendered with heightened tactile presence — water droplets and a subtle sheen amplifying the natural surface. Sleek swimsuit fabric with taut almost plastic-like quality — the material appearing both soft and structured. Reflective sunglasses with dark mirror finish. Shimmering water surface creating dynamic light patterns — cool blue tones rippling with highlights. The high-contrast slightly desaturated processing gives all textures an almost hyperreal quality — surfaces appear more defined and present than natural observation.",
  },
  {
    id: "texture_068",
    title: "Polished Wood Gold Painted Detail Paper Documentary",
    prompt: "Smooth polished wood with warm amber grain patterns — the surface reflecting soft light with a satin sheen. Intricate gold and painted decorative details rendered with documentary precision — every brushstroke and gilded accent clearly visible. Finely carved teeth and edges of crafted objects with sharp tactile detail. Soft white paper texture providing clean neutral contrast. The true-to-life rendering captures material qualities that might be missed by casual observation — the warmth of aged wood the subtle shimmer of gold leaf the delicate layering of paint on carved surfaces.",
  },
  {
    id: "texture_069",
    title: "Plush Loungewear Soft Bedding Crisp Paper",
    prompt: "Soft plush texture of loungewear and bedding contrasted with crisp tangible texture of paper currency and banknotes — rich tactile details captured with almost visceral clarity — all contributing to an idealized reality that blends comfort with material excess.",
  },
  {
    id: "texture_070",
    title: "Soft Worn Cotton Organic Leaf Natural",
    prompt: "Soft worn texture of a cotton t-shirt and organic textures of surrounding leaves and foliage — tactile richness captured with unpretentious clarity and naturalistic rendering.",
  },
  {
    id: "texture_071",
    title: "Plush Hoodie Smooth Fabric Voluminous Hair Hyperreal",
    prompt: "Soft plush texture of a hoodie — smooth fabric of an underlying t-shirt — and voluminous waves of hair all contributing to a rich tactile experience — captured with an idealized almost hyperreal clarity presenting a version of reality optimized for digital consumption.",
  },
  {
    id: "texture_072",
    title: "Smooth Skin Delicate Gold Necklace Varied Display",
    prompt: "Smooth texture of skin — delicate gold of a necklace catching light — and varied textures of accessories and display items in the background adding subtle visual interest and depth.",
  },
  {
    id: "texture_073",
    title: "Delicate Flower Petals Smooth Skin Green Stems",
    prompt: "Large delicate petals of flowers in full bloom — green stems creating a lush natural backdrop — smoothness of skin — contrast between organic floral textures and smooth complexion — tactile richness of botanical elements rendered with serene clarity.",
  },
  {
    id: "texture_074",
    title: "Tweed Plaid White Shirt Structured Tote",
    prompt: "Tailored brown tweed suit with plaid pattern of dark green brown and black hues — crisp white dress shirt underneath — structured olive-green tote bag with sharp lines — silver laptop surface — the mix of woven wool formal cotton and stiff canvas creating layered tactile interest.",
  },
  {
    id: "texture_075",
    title: "Wool Metallic Under Flash Glossy Starburst",
    prompt: "Rich wool of sweater and rough tweed look almost metallic under harsh flash — glossy glasses throw starbursts — polished desk surface reflects stark light — hair strands blaze into golden streaks — every texture pops with electric aggressive intensity under the confrontational illumination.",
  },
  {
    id: "texture_076",
    title: "Glossy Hair Synthetic Lace Plush Childhood",
    prompt: "Glossy hair finish with movement and a hint of chaos — synthetic shine meets baby-girl softness — lace trim and bloomers with visible garters — plush toy or charm details adding childhood nostalgia — layers of visual contrast between hard shine and delicate fabric — satin fringe hair that swings with exaggerated expensive movement under flash.",
  },
  {
    id: "texture_077",
    title: "Oversized Tee Plush Socks Throw Blanket Rumpled",
    prompt: "Oversized tee maybe vintage or college-logo worn like a dress — plush socks and soft throw blanket barely in frame — hair slightly rumpled like just woke up — babydoll dress or ruffled thermal — satin pillow and plush toy nearby — terry or lace socks one slightly falling down — worn-in softness throughout with every textile inviting touch.",
  },
  {
    id: "texture_078",
    title: "Piecey Silk Hair Feathered Glossing Oil Shimmer",
    prompt: "Piecey floaty hair with layers reflecting light like a stack of glass sheets — ribbons of silk softly overlapping — feathered and softened ends lightly razored — under flash the ends reflect in a diffuse shimmer not sharp — styled with light glossing oil or cream emphasizing natural sheen — dry silk texture not glossy — tapered wispy ends with natural softness — effortless but intentional.",
  },
  {
    id: "texture_079",
    title: "Warm Ceramic Soft Skin Vapor Tousled Fabric",
    prompt: "Warm ceramic of a teacup — soft skin — rising steam vapor — tousled fabric of a camisole and soft skirt — ribbed cotton linen or worn-in silk with washed finish — lace trim details — slightly damp hair ends — everything touchable and lived-in — the textures of a morning still unfolding.",
  },
  {
    id: "texture_080",
    title: "Silk Satin Robe Linen Brushed Hair Sheer Glow",
    prompt: "Silk or satin robe in champagne antique rose or dusty lilac — delicate lace or eyelet camisole underneath — linen sheets and sheer curtain glow — brushed hair with soft bends and gentle flyaways — thin gold necklace catching light — compact mirror surface — all textures suggest morning intimacy and quiet luxury.",
  },
];

export const Mood = [
  {
    id: "mood_001",
    title: "Curated Cool Intimate Connection",
    prompt: "Ethereal Softness Meets Curated Cool with Intimate Connection: This distinctive vibe embodies delicate sense of intimate connection combined with almost dreamlike quality that feels both contemporary and timeless. Mood is not merely observed but meticulously constructed by camera precise rendering elevating scene beyond ordinary visual experience. There is inherent gentleness and approachability yet underneath lies current of intentional curation and sophisticated taste. Subject appears both vulnerable and in complete control. Overall emotional register reads as introspective but not sad soft but not weak curated but not trying too hard expensive but not flashy",
  },
  {
    id: "mood_002",
    title: "Old Money Confidence",
    prompt: "Quiet Luxury and Understated Power: Overall mood exudes sense of wealth so secure it need not announce itself power so inherent it requires no performance. This is aesthetic of old money of inherited confidence of knowing one worth without needing external validation. Every element whispers rather than shouts from muted color palette to subtle designer details. Vibe is simultaneously relaxed and controlled casual and intentional. Subject appears unbothered as if they simply exist this way naturally yet careful observer notices how everything has been considered",
  },
  {
    id: "mood_003",
    title: "Defiant Power",
    prompt: "Raw Vulnerability with Defiant Authenticity: This mood captures moment of genuine emotional exposure combined with underlying strength that refuses to apologize for it. Vibe reads as real unguarded perhaps caught in moment of genuine feeling yet somehow this vulnerability becomes its own form of power. Subject might appear tired emotional mid-laugh on verge of tears or simply caught in unguarded moment of thought. Authenticity comes from apparent lack of artifice - hair might be slightly messy makeup smudged or minimal clothing rumpled",
  },
  {
    id: "mood_004",
    title: "Golden World Aspirational",
    prompt: "Privileged Summer Romance: Mood evokes exclusive world of private beaches country clubs and inherited wealth - feeling of security and belonging - subject exists in protected bubble of beauty and ease - simultaneously aspirational and nostalgic making viewer long for access to this golden world",
  },
  {
    id: "mood_005",
    title: "Coming-of-Age Indie Film",
    prompt: "The photo opens like a still from a long-lost coming-of-age film — grainy flash, a hint of overexposure, and the sort of light that makes skin look like porcelain. The photo feels like a frame from an indie film — the kind where the person never speaks, but drives the story. The viewer can't tell if they're the main character or the observer, but the energy is clear: They know they're being watched. And they let you watch — just for a second.",
  },
  {
    id: "mood_006",
    title: "Enchanted Miniature Mystical Realm",
    prompt: "Magical Realism Wonder: Mood blends hyper-realistic detail with fantastical ethereal atmosphere creating sense of stepping into enchanted miniature world - viewer experiences wonder and meticulous artistry - scene feels like beautifully crafted diorama or moment from high-fantasy nature documentary - peaceful yet captivating with luminous focal points drawing eye into secluded mystical realm",
  },
  {
    id: "mood_007",
    title: "Wilderness Resilience Harsh Environments",
    prompt: "Authentic Wilderness Serenity: Mood celebrates raw beauty of nature's resilience and strength - intimate documentary perspective inviting viewer to appreciate minute details of overlooked natural ecosystems - sense of peace connection to earth and quiet contemplation - despite busy composition overall impression is harmonious and grounded - evokes respect for life thriving in harsh environments",
  },
  {
    id: "mood_008",
    title: "Curated Authentic Subtle Glamour",
    prompt: "This image is perfectly suited for a fashion editorial an indie lifestyle blog a personal portfolio or a social media feed aiming for a curated authentic and subtly glamorous aesthetic all elevated and made timeless by the unique evocative qualities of film photography.",
  },
  {
    id: "mood_009",
    title: "Ethereal Beauty Sophisticated Calm",
    prompt: "This image is perfectly suited for a high-end lifestyle blog a fashion editorial with an intimate mood or an artistic social media feed designed to evoke a sense of ethereal beauty sophisticated calm and a gentle personal connection all meticulously crafted and enhanced by the sophisticated eye of a professional camera system.",
  },
  {
    id: "mood_010",
    title: "Kawaii Culture Alluring Innocence Youthful",
    prompt: "This image is perfectly suited for a fashion-forward social media feed a niche lifestyle blog focused on Japanese street style or Kawaii culture or a brand campaign targeting a youthful playful demographic designed to project an image of alluring innocence and vibrant stylized charm all meticulously crafted and enhanced by the sophisticated eye of a professional camera and artistic color grading.",
  },
  {
    id: "mood_011",
    title: "Luxury Fashion Magazine Aspirational",
    prompt: "This image is perfectly suited for a high-end fashion magazine cover a luxury brand campaign or an exclusive event's social media designed to evoke a sense of sophisticated glamour serene confidence and aspirational beauty all meticulously crafted and enhanced by the powerful transformative lens of a master photographer and advanced camera system.",
  },
  {
    id: "mood_012",
    title: "Timeless European Cultural Immersion",
    prompt: "This image is perfectly suited for a high-end fashion editorial a luxury travel blog or an artistic social media feed designed to evoke a sense of timeless European elegance contemplative beauty and aspirational cultural immersion all through the powerful transformative lens of a master photographer and sophisticated camera system.",
  },
  {
    id: "mood_013",
    title: "Serene Natural Elegance Wellness",
    prompt: "This image is perfectly suited for a high-end fashion editorial a luxury lifestyle campaign focusing on wellness or an artistic social media feed designed to evoke a sense of profound serenity natural elegance and aspirational yet relatable beauty all meticulously crafted and amplified through the powerful transformative lens of a master photographer and sophisticated camera system.",
  },
  {
    id: "mood_014",
    title: "Contemplative Artistic Film Introspection",
    prompt: "This image is perfectly suited for an artistic photography portfolio a contemplative lifestyle blog or a high-end editorial feature designed to evoke a sense of serene natural beauty intimate introspection and timeless photographic artistry all powerfully shaped and amplified by the specific characteristics of film photography.",
  },
  {
    id: "mood_015",
    title: "Ethereal Fantasy Nature Connection",
    prompt: "This image is perfectly suited for an artistic photography portfolio an ethereal fashion editorial a fantasy-inspired blog or a mood-driven social media feed designed to evoke a sense of deep connection to nature mystical beauty and dreamlike introspection all meticulously crafted and enhanced by the specific photographic choices to create a scene that feels truly magical and otherworldly.",
  },
  {
    id: "mood_016",
    title: "Romantic Vulnerability Timeless Film",
    prompt: "This image is perfectly suited for a high-end fashion editorial an artistic photography series or a mood-driven personal blog designed to evoke a sense of timeless beauty ethereal naturalism and profound yet gentle emotional depth all through the unparalleled aesthetic power of authentic film photography.",
  },
  {
    id: "mood_017",
    title: "Untamed Romantic Melancholy Elegance",
    prompt: "This image is perfectly suited for a high-fashion editorial an artistic album cover or a curated lifestyle blog focusing on vintage aesthetics and natural beauty designed to evoke a sense of quiet strength romantic melancholy and untamed elegance all meticulously sculpted and enhanced by the unique properties of classic film photography.",
  },
  {
    id: "mood_018",
    title: "Gothic Forbidden Romance Tension",
    prompt: "This image evokes gothic romance forbidden desire and underlying tension through sharp contrast between pale luminous figures and deep dark backgrounds. The heightened romance and dramatic visual tension make the scene feel like a moment from a dark fairy tale or romantic thriller — the palette designed to feel intense and impactful.",
  },
  {
    id: "mood_019",
    title: "Alternative Artistic Haunting Vulnerability",
    prompt: "This image is perfectly suited for an alternative fashion editorial an indie film poster an art photography series or a mood-driven personal blog designed to evoke a sense of profound beauty artistic vulnerability and a haunting ethereal presence all masterfully created and intensified by the unique characteristics of the photographic medium.",
  },
  {
    id: "mood_020",
    title: "Joyful Whimsical Cottagecore Spring",
    prompt: "This image is perfectly suited for a whimsical lifestyle blog a joyful social media feed or an editorial piece on nature and happiness designed to evoke pure joy enchanting beauty and an aspirational sense of carefree elegance all meticulously crafted and enhanced by the evocative lens of the camera.",
  },
  {
    id: "mood_021",
    title: "90s Fashion Timeless Subtle Sensuality",
    prompt: "This image is perfectly suited for a high-fashion editorial a luxury brand campaign or a nostalgic beauty feature designed to evoke a sense of timeless elegance subtle sensuality and iconic 90s supermodel cool all meticulously crafted and enhanced by the specific properties of film photography and professional studio techniques.",
  },
  {
    id: "mood_022",
    title: "Road Trip Cherished Memory Spontaneous",
    prompt: "This image is perfectly suited for a personal travel blog an artistic social media feed or a lifestyle campaign designed to evoke a sense of cherished memories spontaneous beauty and the gentle allure of a moment captured in time all through the powerful transformative lens of a master photographer and sophisticated camera system.",
  },
  {
    id: "mood_023",
    title: "Raw Elegance Naturalistic Contemplative",
    prompt: "This image is perfectly suited for a high-end fashion editorial a luxury lifestyle campaign or an artistic portrait series designed to evoke a sense of raw elegance natural beauty and contemplative allure all meticulously crafted and enhanced by the authentic timeless rendering of medium format film photography.",
  },
  {
    id: "mood_024",
    title: "Windswept Drama Raw Glamour",
    prompt: "This image is perfectly suited for a high-fashion editorial spread an art photography portfolio or a curated social media feed designed to evoke a powerful sense of untamed beauty windswept drama and raw yet glamorous vulnerability all meticulously crafted and enhanced by the sophisticated eye of a professional camera and distinct post-production aesthetic.",
  },
  {
    id: "mood_025",
    title: "Sublime Wilderness Fashion Resilience",
    prompt: "This image is perfectly suited for a high-fashion editorial an artistic travel journal or a fine art photography collection designed to evoke a sense of sublime beauty elegant strength and the harmonious integration of human artistry with the grandeur of the natural world all rendered with the timeless evocative magic of film photography.",
  },
  {
    id: "mood_026",
    title: "Bohemian Freedom Summer Contemplation",
    prompt: "This image is perfectly suited for a bohemian fashion editorial a lifestyle blog focused on travel and introspection or an artistic social media feed designed to evoke a sense of serene beauty contemplative freedom and timeless summer nostalgia all meticulously crafted and enhanced by the unique properties of medium format film photography.",
  },
  {
    id: "mood_027",
    title: "Indie Bohemian Sun-Kissed Confidence",
    prompt: "This image is perfectly suited for a fashion editorial targeting retro or indie markets a lifestyle blog focused on vintage aesthetics or a personal portfolio designed to evoke a sense of timeless bohemian beauty relaxed confidence and sun-drenched nostalgia all powerfully articulated and enhanced by the unique visual language of analog film photography.",
  },
  {
    id: "mood_028",
    title: "Summer Dream Freedom Natural Splendor",
    prompt: "This image is perfectly suited for a bohemian fashion editorial a travel blog or an artistic social media feed designed to evoke a sense of freedom natural beauty and a nostalgic summer dream all meticulously crafted and enhanced by the sophisticated optical and tonal characteristics of classic film photography.",
  },
  {
    id: "mood_029",
    title: "Serene Forest Grace Portra Warmth",
    prompt: "This image is perfectly suited for an artistic portrait series an outdoor lifestyle brand campaign or a personal blog designed to evoke a sense of serene natural beauty nostalgic contemplation and timeless grace all profoundly shaped and enhanced by the distinctive aesthetic of Kodak Portra 400 medium format film.",
  },
  {
    id: "mood_030",
    title: "Escapist Intellectual Quiet Adventure",
    prompt: "This image is perfectly suited for an artistic travel blog a niche literary social media feed or a personal diary-style publication designed to evoke a sense of thoughtful escape authentic adventure and quiet intellectualism all powerfully constructed and stylized through the unique capabilities of the photographic medium.",
  },
  {
    id: "mood_031",
    title: "Urban Cinematic Psychological Depth",
    prompt: "This image is perfectly suited for a gritty independent film poster a character study in a drama series or an artistic social commentary piece designed to evoke a powerful sense of urban vulnerability raw emotion and psychological depth all masterfully enhanced and distilled by the unique visual language of professional cinematography.",
  },
  {
    id: "mood_032",
    title: "Approachable Cool Magnetic Presence",
    prompt: "This image is perfectly suited for a lifestyle brand campaign a personal branding profile or a high-end editorial feature designed to evoke a sense of thoughtful approachable coolness and magnetic intensity all meticulously crafted and enhanced by the sophisticated eye of a professional photographer and top-tier camera system.",
  },
  {
    id: "mood_033",
    title: "Rebellious Raw Beauty Magnetic Allure",
    prompt: "This image is perfectly suited for a personal social media feed a fashion-forward blog with an edgy twist or an online zine designed to project an image of confident raw beauty and magnetic allure all amplified by the intimate and unfiltered lens of a modern smartphone camera.",
  },
  {
    id: "mood_034",
    title: "Romantic Grunge 90s Vulnerable Allure",
    prompt: "This image is perfectly suited for a high-fashion archival collection a vintage-inspired editorial or an artistic social media feed designed to evoke a sense of delicate beauty romantic vulnerability and the timeless allure of 90s fashion all elevated and transformed by the evocative power of analog film photography.",
  },
  {
    id: "mood_035",
    title: "Golden Age Cinema Nostalgic Romance",
    prompt: "This image is perfectly suited for a vintage fashion editorial a classic travel blog or an artistic social media feed designed to evoke a profound sense of nostalgic romance serene natural beauty and a timeless graceful femininity all through the powerful transformative lens and unique color science of a mid-century film camera.",
  },
  {
    id: "mood_036",
    title: "Summer Reverie Garden Introspection",
    prompt: "This image is perfectly suited for a high-end fashion editorial an artistic portrait series or a nostalgic lifestyle blog designed to evoke a sense of dreamy introspection natural beauty and a poignant moment of summer reverie all elevated and transformed by the unique inimitable qualities of film photography.",
  },
  {
    id: "mood_037",
    title: "Winter Escape Warm Comfort Intellectual",
    prompt: "This image is perfectly suited for a luxury travel blog a wellness retreat advertisement or an aspirational lifestyle social media post designed to evoke a sense of peaceful escape warm comfort in a cold environment and intellectual relaxation all meticulously crafted and enhanced by the sophisticated visual language of modern computational photography.",
  },
  {
    id: "mood_038",
    title: "Pastoral Romance Ethereal Nostalgia",
    prompt: "This image is perfectly suited for a high-end fashion editorial an artistic social media feed or a fine art photography portfolio designed to evoke a sense of dreamlike elegance pastoral romance and ethereal beauty all through the powerful transformative lens of a master photographer and sophisticated film system.",
  },
  {
    id: "mood_039",
    title: "Idyllic Comfort Sun-Drenched Tranquility",
    prompt: "This image is perfectly suited for a lifestyle blog a wellness retreat advertisement or an aspirational social media feed designed to evoke a sense of serene comfort idyllic escape and sun-drenched tranquility all meticulously crafted and enhanced by the sophisticated eye of a professional camera system to create a truly evocative visual experience.",
  },
  {
    id: "mood_040",
    title: "Folkloric Whimsical Nature Magical",
    prompt: "This image is perfectly suited for an artistic nature photography series a whimsical fashion editorial or a personal blog focused on natural beauty and introspection all meticulously crafted and transformed by the unique qualities of analog film photography and a discerning lens.",
  },
  {
    id: "mood_041",
    title: "Summer Adventure Nostalgic Forest Magic",
    prompt: "This image is perfectly suited for a personal travel blog an indie music album cover or a nostalgic social media feed designed to evoke a sense of freedom joy and the magical essence of a summer adventure all beautifully enhanced and given character by the chosen photographic medium.",
  },
  {
    id: "mood_042",
    title: "Ethereal Melancholy Folkloric Timeless",
    prompt: "This image is perfectly suited for an artistic portrait series an indie film aesthetic a personal blog focused on mood and introspection or an alternative fashion editorial designed to evoke a sense of profound ethereal melancholy and timeless beauty all meticulously crafted and enhanced by the transformative power of analog film photography.",
  },
  {
    id: "mood_043",
    title: "Lavender Natural Beauty Serene Allure",
    prompt: "This image is perfectly suited for a high-end beauty campaign a lifestyle magazine spread or an artistic social media feed designed to evoke a sense of serene natural beauty delicate allure and sun-drenched tranquility all meticulously crafted and enhanced by the sophisticated eye of a professional camera.",
  },
  {
    id: "mood_044",
    title: "Kawaii Whimsical Joyful Winter Adventure",
    prompt: "This image is perfectly suited for a personal travel blog a Kawaii fashion influencer's social media or a cheerful lifestyle campaign designed to evoke a sense of pure joy whimsical adventure and an idealized vibrant winter experience all heightened and stylized by the camera's specific filters and processing beyond the realm of simple reality.",
  },
  {
    id: "mood_045",
    title: "Exuberant Snow Day Social Media",
    prompt: "Perfectly suited for a lively social media post a personal blog celebrating adventure or an outdoor lifestyle campaign. Designed to evoke pure unadulterated joy and raw beauty of a winter wonderland — all amplified and made intensely real by the camera's unique ability to capture and enhance dynamic motion and environmental drama. Feeling of being physically present in cold exhilarating environment experiencing the moment as if there.",
  },
  {
    id: "mood_046",
    title: "Kawaii Cute Social Winter Joy",
    prompt: "Perfectly suited for a personal social media feed a fashion blog specializing in cute or Kawaii styles or promotional material for winter tourism. Designed to evoke pure joy innocent playfulness and a magical idealized winter experience — all heightened and stylized through the camera's transformative lens and post-processing creating a sugary fantastical world beyond natural reality.",
  },
  {
    id: "mood_047",
    title: "Summer Wanderlust Nostalgic Freedom",
    prompt: "Nostalgic warmth and authenticity — the overall warmth combined with slightly desaturated yet rich colors immediately evokes nostalgia and timelessness feeling like a cherished memory from a summer past. Sun-drenched optimism radiating carefree spirit of summer. Balanced vibrancy — engaging yet harmonious preventing harshness. Freedom joy and spontaneous connection with nature and animal companion. Perfect for summer lifestyle travel or bohemian adventure content.",
  },
  {
    id: "mood_048",
    title: "Dreamy Mountain Adventure Youthful Freedom",
    prompt: "Perfectly suited for a personal travel blog an adventure lifestyle social media feed or a brand evoking youthful freedom. Designed to capture genuine moment of uninhibited joy and exploration all elevated with profound sense of nostalgia and ethereal beauty through unique transformative characteristics of analog film photography. The dreamy faded quality makes the moment feel less like reality and more like a cherished slightly hazy recollection of the perfect adventure.",
  },
  {
    id: "mood_049",
    title: "High-Fashion Powerful Elegance Aspirational",
    prompt: "Perfectly suited for high-end fashion editorial luxury jewelry campaign or prestigious beauty brand. Designed to evoke powerful elegance sophisticated allure and aspirational beauty — all meticulously crafted and enhanced by sophisticated professional camera and lighting setup. The powerful direct gaze combined with understated luxury communicates confidence and high quality. Subject appears both strong and alluring commanding attention through refined restraint.",
  },
  {
    id: "mood_050",
    title: "Timeless Beauty Radiant Celebrity",
    prompt: "Perfectly suited for high-end beauty advertisement celebrity portrait or editorial feature. Designed to evoke timeless elegance natural radiance and sophisticated allure — all meticulously crafted by master photographer and sophisticated camera system. Serene healthy beauty with quiet confidence and approachability. An air of candid contemplation making the subject feel both aspirational and relatable — the essence of classic Hollywood beauty meets modern editorial sensibility.",
  },
  {
    id: "mood_051",
    title: "Earthy Wilderness Introspective Artistic",
    prompt: "Perfectly suited for artistic editorial a high-end fashion campaign with naturalistic bent a deeply personal lifestyle blog or any platform seeking to evoke profound emotion and timeless beauty through unparalleled aesthetic qualities of meticulously simulated film photography. Introspective calm and authentic wilderness-inspired beauty — the subject conveys private contemplative moment in nature. Emotional richness feeling like a cherished memory imbued with tactile almost palpable presence.",
  },
  {
    id: "mood_052",
    title: "Vintage Intimate Vulnerable Nostalgic",
    prompt: "Dreamlike nostalgic intimacy with sense of gentle vulnerability. The mirror reflection creates narrative depth suggesting introspection and self-awareness. Film grain and soft focus contribute to memory-like quality — the scene feels protective and intimate yet revealing. Desaturated colors softened by time contribute to feeling of cherished personal moment. Subject appears vulnerable and present in quiet private space.",
  },
  {
    id: "mood_053",
    title: "Antarctic Pristine Adventure Majestic",
    prompt: "Sense of pristine untouched majesty — vast polar landscape creating awe and wonder. Subject integrated within the grandeur feeling both tiny against the scale and deeply connected to the environment. Wildlife adding charm and narrative warmth to the scene. The purity and luminosity of the environment creates almost heavenly ethereal feeling. Perfect for adventure travel premium lifestyle or outdoor brand content.",
  },
  {
    id: "mood_054",
    title: "Pristine Luxury Aspirational Perfection",
    prompt: "Perfect essence where luxury is not just seen but felt — pristine luminous incredibly detailed and deeply evocative. Every photographic element conspires to create idealized aspirational reality. Soft expansive illumination making everything appear radiant and perfectly illuminated almost existing in an idealized space. Subject's interaction with pristine environment feels natural yet elevated — authentic opulence rather than artificial enhancement. Perfect for luxury lifestyle hospitality or premium brand content.",
  },
  {
    id: "mood_055",
    title: "Wabi-Sabi Tranquil Melancholy Poetic Silence",
    prompt: "Perfectly suited for a niche art photography platform designed to resonate with an audience that seeks depth silence and poetic beauty over glamour. The mood is one of tranquil melancholy profound simplicity and deeply beautiful imperfection — a visual haiku rather than a photograph. Mono no Aware — a gentle sadness for the impermanence of all things — pervades every element. The quiet intensity of the gaze speaks volumes about an unspoken internal world. Yūgen — the beauty of things unseen — is felt rather than shown.",
  },
  {
    id: "mood_056",
    title: "Evening Street Candid Intimate Lifestyle",
    prompt: "Perfectly suited for personal social media like Instagram designed to highlight an intimate yet stylish personal moment. The mood is subtly alluring and candid — a spontaneous moment captured with quiet sophistication. Quiet allure and contemporary chic — candid authenticity blended with curated elegance characteristic of sophisticated lifestyle aesthetic. The evening urban setting adds a cinematic quality to what feels like a genuine personal moment.",
  },
  {
    id: "mood_057",
    title: "Urban Editorial Confident Contemporary",
    prompt: "Perfectly suited for a fashion magazine spread lookbook or high-end social media campaign designed to showcase contemporary style and natural beauty within an urban context. The mood is confident artfully casual with an editorial yet candid feel — sophisticated lifestyle photography that projects effortless cool within architectural surroundings.",
  },
  {
    id: "mood_058",
    title: "Warm Artistic Casual Contentment",
    prompt: "The mood is one of quiet contentment artistic appreciation and sophisticated casualness — candid yet curated lifestyle photography. The warmth and authenticity of the vintage filter contributes to a sense of genuine personal moment elevated by artistic sensibility. Relaxed and engaging — the viewer feels they are sharing a pleasant intimate moment with the subject.",
  },
  {
    id: "mood_059",
    title: "SoundCloud Brazen Playful Provocative DIY",
    prompt: "Perfectly suited for personal social media designed to project a confident fun and slightly edgy persona. The mood is bold playful and a bit provocative — embodying the brazen unvarnished spirit of 2016 SoundCloud visual culture. A candid personal snapshot style where rawness is the point — anti-polish anti-curation proudly DIY. The aesthetic celebrates imperfection and self-assured attitude over technical quality.",
  },
  {
    id: "mood_060",
    title: "Melancholic Mysterious Atmospheric Gothic",
    prompt: "The overall mood is melancholic mysterious and highly atmospheric — embodying a curated artistic or fashion editorial photography style. Designed to evoke a sense of dramatic beauty and enigmatic introspection. The atmosphere is profoundly immersive — reality's edges blur into something more dreamlike and contemplative. Introspective and slightly distant — the subject exists in their own atmospheric world. Suited for alternative fashion editorials art photography portfolios or mood-driven social media feeds.",
  },
  {
    id: "mood_061",
    title: "Contemplative Nostalgic Subtly Surreal Dreamlike",
    prompt: "The overall mood is contemplative nostalgic and subtly surreal — blending personal intimate moments with abstract dreamlike vision. A curated artistic or avant-garde social media aesthetic where reality and dream intermingle without clear boundary. Modern romanticism meets surrealist sensibility. Designed to evoke dreamy introspection and modern surrealism — suited for art blogs mood boards or alternative social media feeds.",
  },
  {
    id: "mood_062",
    title: "Authentic Awkward Intimately Personal Vulnerable",
    prompt: "The overall mood is authentic intimately personal and subtly vulnerable — embodying a candid uncurated personal snapshot style characteristic of early social media uploads. Genuine unpretentious self-expression where endearing awkwardness feels honest rather than manufactured. Raw expression triumphs over mainstream polish — designed to connect with audiences who value authenticity and lo-fi aesthetics. Suited for personal blogs niche online communities or archival social media posts.",
  },
  {
    id: "mood_063",
    title: "Alluring Introspective Mysteriously Enigmatic",
    prompt: "The overall mood is alluring introspective and subtly mysterious — embodying curated artistic or high-fashion lifestyle photography. Enigmatic beauty and quiet intensity create a pull that is both inviting and distant. Serene yet pensive — the gaze suggests depths beyond what is visible. Designed to evoke elegant allure and enigmatic charm — suited for fashion blogs mood-driven social media feeds or online portfolios.",
  },
  {
    id: "mood_064",
    title: "Cool Effortlessly Stylish Authentically Rebellious",
    prompt: "The overall mood is cool effortlessly stylish and authentically rebellious — embodying candid uncurated personal snapshot or street style photography. A sense of rebellious artistic detachment and spontaneous fun. The aesthetic is confident and unposed — playful without being performative. Designed to capture genuine moments of youthful self-expression with undeniable retro cool — suited for personal blogs alternative fashion feeds or archival social media posts.",
  },
  {
    id: "mood_065",
    title: "Intense Provocative Self-Assured Edgy",
    prompt: "The overall mood is intense provocative and self-assured — embodying curated artistic or alternative social media photography. A sense of daring power and controlled rebellion — assertive body language juxtaposing vulnerability with strength. The moody cinematic atmosphere reinforces the edgy allure. Designed to evoke powerful self-expression — suited for alternative fashion blogs mood-driven social media feeds or online portfolios.",
  },
  {
    id: "mood_066",
    title: "Calm Intensity Introspective Beauty Timeless Elegance",
    prompt: "The overall mood is one of calm intensity introspective beauty and timeless elegance — serene yet captivating with a hint of quiet strength. The aesthetic radiates natural purity and gentle grace — a serene approachable elegance that feels both fresh and profoundly timeless. Designed for sophisticated artistic portfolios luxury brand campaigns or high-end minimalist editorials — engineered to convey trustworthiness approachability and youthful grace.",
  },
  {
    id: "mood_067",
    title: "Serene Aspirational Nostalgic Summer Freedom",
    prompt: "The overall mood is serene aspirational and timeless — embodying high-end lifestyle or cinematic photography. A sense of effortless freedom contemplation and serene enjoyment — quiet luxury and escape. Designed to evoke aspirational freedom beauty and nostalgic summer dreams — suited for luxury lifestyle magazines travel blogs or high-end social media campaigns.",
  },
  {
    id: "mood_068",
    title: "Nostalgic Romantically Melancholic Cinematic Wanderlust",
    prompt: "The overall mood is nostalgic serene and romantically melancholic — embodying curated lifestyle or cinematic photography. A sense of quiet introspection and youthful freedom — gracefully immersed in the moment. The dramatic natural light elevates ordinary scenes into idyllic ethereal settings. Designed to evoke wanderlust quiet beauty and cinematic introspection — suited for lifestyle blogs travel journals or high-end social media feeds.",
  },
  {
    id: "mood_069",
    title: "Cool Sophisticated Subtly Rebellious Glamorous",
    prompt: "The overall mood is cool sophisticated and subtly rebellious — embodying curated fashion editorial or high-end lifestyle photography. Mysterious allure and unapologetic self-possession — confident relaxed posture with intense unsmiling gaze. The aesthetic projects power through restraint — enigmatic glamour that feels both accessible and untouchable. Designed to project an enigmatic glamorous and distinctly edgy persona — suited for fashion-forward social media feeds alternative beauty blogs or online magazines.",
  },
  {
    id: "mood_070",
    title: "Respectful Appreciative Museum-Quality Aesthetic",
    prompt: "The overall mood is respectful appreciative and deeply aesthetic — embodying museum-quality product photography or archival documentation style. The approach emphasizes cultural significance over casual display — each element presented with reverence for craftsmanship and tradition. Documentary clarity meets refined aesthetic sensibility. Designed to showcase traditional beauty and meticulous artistry with objective clarity — suited for cultural heritage catalogs artisan portfolios or curated historical exhibits.",
  },
  {
    id: "mood_071",
    title: "Extreme Understated Opulence Relaxed Aspirational",
    prompt: "The overall mood is one of extreme yet paradoxically understated opulence and complete relaxation — embodying curated wealth-porn or aspirational lifestyle photography where the contrast between cozy and extravagant elements creates a surreal blend — inviting both awe and a touch of voyeurism into a highly exclusive world — projecting ultimate financial freedom and an enviable unbothered existence.",
  },
  {
    id: "mood_072",
    title: "Innocent Adventure Lighthearted Genuine Unpretentious",
    prompt: "The overall mood is one of innocent adventure lighthearted awkwardness and genuine unpretentious fun — embodying a candid personal snapshot style — evoking quirky charm relatable amateurism and a genuine moment of self-discovery.",
  },
  {
    id: "mood_073",
    title: "Cool Energetic Authentically Rebellious Indie",
    prompt: "The overall mood is cool energetic and authentically rebellious — embodying a curated indie fashion editorial or street style photography — evoking rebellious spirit artistic vision and electrifying youthful energy suited for alternative fashion or youth culture.",
  },
  {
    id: "mood_074",
    title: "Rebellious Moody Authentically Alternative",
    prompt: "The overall mood is rebellious moody and authentically alternative — embodying a candid social media post or album cover for an indie band — projecting an edgy authentic and defiantly cool persona suited for alternative music communities or non-conformist expression.",
  },
  {
    id: "mood_075",
    title: "Cheerful Flirtatious Aspirational Social Media",
    prompt: "The overall mood is cheerful flirtatious and aspirational — embodying quintessential curated social media influencer or personal branding photography — designed for maximum visual appeal and engagement through digital enhancement — projecting approachable glamour and confident playful self-expression.",
  },
  {
    id: "mood_076",
    title: "Melancholic Rebellious Raw Indie Underground",
    prompt: "The overall mood is melancholic rebellious and subtly provocative — embodying a candid raw indie or underground photography style — evoking poignant rebellion and unconventional beauty suited for alternative subcultures.",
  },
  {
    id: "mood_077",
    title: "Humorous Self-Aware Aspirational Relatable Luxury",
    prompt: "The overall mood is humorous self-aware and aspirational — embodying a candid social media post designed for engagement and relatability within a luxury-obsessed culture — showcasing a relatable yet aspirational persona.",
  },
  {
    id: "mood_078",
    title: "Chic Playful Aspirational High-Fashion",
    prompt: "The overall mood is chic playful and aspirational — embodying a curated fashion blog or high-end lifestyle photography style — showcasing aspirational fashion and a vibrant personality with effortless confidence.",
  },
  {
    id: "mood_079",
    title: "Confident Inviting Aspirational Intimate Connection",
    prompt: "The overall mood is confident inviting and aspirational — embodying a personal social media selfie style designed for intimate connection — projecting approachable glamour and success fostering a sense of warm engagement.",
  },
  {
    id: "mood_080",
    title: "Calm Tranquil Serene Romantic Floral",
    prompt: "The overall mood is calm and tranquil with a touch of romanticism — a serene almost ethereal quality — intimate and gently coy — suited for beauty editorials or personal brand imagery emphasizing natural grace and gentle femininity.",
  },
  {
    id: "mood_081",
    title: "Dreamy Mysterious Elegant Urban",
    prompt: "The overall mood is dreamy and mysterious with elegant urban sophistication — the slightly out-of-focus quality adds a sense of depth and enigma — suited for moody fashion editorials or atmospheric personal portraiture.",
  },
  {
    id: "mood_082",
    title: "Intimate Sensual Relaxed Alluring",
    prompt: "The overall mood is intimate and sensual with a focus on the subject's relaxed yet alluring presence — minimalist somewhat moody atmosphere — quietly provocative with emphasis on vulnerability and physical ease.",
  },
  {
    id: "mood_083",
    title: "Casual Intimate Studious Reflective",
    prompt: "The overall mood is casual and intimate with personal reflection and self-expression — calm organized cozy — a moment of quiet concentration and intellectual engagement in a comfortable domestic setting.",
  },
  {
    id: "mood_084",
    title: "Deliberate Dissonance Rebellious Provocative Editorial",
    prompt: "The overall mood is one of deliberate dissonance — a formal archetype distorted into a rebellious icon — raw editorial anti-polished voyeuristic — a flash-lit aesthetic that feels both accidental and impossibly styled — commanding and aloof confrontational presence — designed to unsettle and fascinate at the same time.",
  },
  {
    id: "mood_085",
    title: "High Fashion Glamour Sophisticated Runway",
    prompt: "The overall mood is one of high fashion and glamour — sophisticated modern aesthetic with attention to detail and impeccable styling — focused contemplative confidence — dramatic theatrical presence suited for runway coverage or fashion editorial.",
  },
  {
    id: "mood_086",
    title: "Performative Vulnerability Emotional Suspension",
    prompt: "The overall mood is performative vulnerability and emotional suspension — she looks like she just finished crying or never started — you want to protect her but also question how much of this is deliberate — intimate but unreadable caught in the moment before she closed the door — stillness charged with noise — rich girl off her leash caught mid-vulnerability arc.",
  },
  {
    id: "mood_087",
    title: "Quiet Chosen Stillness Tender Vulnerability",
    prompt: "The overall mood is quiet chosen stillness and tender vulnerability — feels like she's waiting for someone but not desperately — quiet real submission not performative — passive trusting and just a bit too tender for the room — aesthetic of emotional undressing not performance.",
  },
  {
    id: "mood_088",
    title: "Soft Private Vulnerable Elegance 2AM Mirror",
    prompt: "The overall mood is seeing someone soft and private — caught in a bathroom mirror at 2 a.m. with dewy skin and smudged eyes — vulnerable elegance with luxury without posing and femininity without sharpness — emotional openness and wind-swept softness — unsure whether getting ready or winding down.",
  },
  {
    id: "mood_089",
    title: "Unbothered Relaxed Expensive Unreadable",
    prompt: "The overall mood is unbothered and relaxed with an expensive unreadable quality — not dressing to be seen but aura commands attention — quiet wealth that doesn't perform — restrained confidence that assumes rather than announces — old money ease meeting street nonchalance.",
  },
  {
    id: "mood_090",
    title: "Dreamed About Allowing Not Performing Kitchen",
    prompt: "The overall mood is being dreamed about — she's not performing she's allowing with no pose only presence — emotionally still and intimate — the viewer feels like they're watching through something private — soft submission energy with shoulders dropped inward — quiet vulnerability and morning tenderness — no awareness of being watched.",
  },
  {
    id: "mood_091",
    title: "Warm Haze Emotionally Still Intimate Morning",
    prompt: "The overall mood is warm haze emotionally still and intimate — the viewer feels like they've just woken up next to her — you don't need to see the marble to know it's there — wealth that whispers — couture softness with emotional depth — morning-after elegance with an untouchable tenderness.",
  },
];

export const PhotoStyle = [
  {
    id: "photostyle_001",
    title: "Lana Del Rey Americana Bittersweet",
    prompt: "Vintage Americana Lifestyle with Overexposed Film Aesthetic: Photography style deliberately emulates disposable camera or consumer-grade 35mm film from 1970s-90s captured on vintage 35mm film camera Yashica T4 or disposable Kodak camera with Fuji Superia 400 or Kodak Gold 200 film stock creating signature overexposed sun-bleached aesthetic with pronounced organic grain soft focus dreamy light flares and characteristic filmic dynamic range with blown-out highlights that evoke nostalgic summer memories and carefree coastal Americana perfection - characteristic overexposure blown highlights visible grain and soft focus creating nostalgic dreamy quality - composition appears candid and unstaged as if capturing genuine moment during summer vacation but is actually carefully constructed - lighting utilizes late afternoon sun positioned 10-15 degrees above horizon creating warm golden directional light with intentional overexposure that blows out highlights and creates dreamy sun-bleached aesthetic - natural lens flares and light leaks adding to nostalgic film quality - sun backlighting subject creating ethereal glow around hair and edges while still illuminating face with reflected light from water or sand - color palette features dominant overexposed whites and creams creating dreamy washed-out base - soft powder blues and faded navy suggesting ocean and sky - warm peachy skin tones with rosy blush appearing luminous and healthy - accents of weathered wood grey aged brass gold and faded red from American flags - pops of hydrangea blue soft pink and sage green from natural elements - colors are sun-bleached and faded with warm peachy skin tones and washed-out backgrounds - overall palette evokes vintage summer photographs from 1970s Cape Cod with romantic nostalgic quality that feels both privileged and accessible - colors are never saturated but rather gently faded as if bleached by endless summer sun creating happy melancholic timeless Americana aesthetic - occasional lens flares and light leaks adding to authentic film feeling - overall style references vintage Ralph Lauren campaigns classic Americana photography and contemporary Lana Del Rey aesthetics - overall effect is impossibly romantic and nostalgic evoking vintage summer photographs from American coastal vacations with that perfect Lana Del Rey music video quality where everything feels like beautiful fading memory - images feel simultaneously documentary and aspirational like personal photographs from someone's perfect privileged summer that viewer wishes they had experienced - emotional register evokes perfect endless summer with feeling of being young beautiful and privileged during magical coastal vacation where every moment feels suspended in amber - subject appears genuinely happy with authentic smile but there's underlying wistfulness as if she knows this perfection is fleeting - mood is simultaneously joyful and nostalgic present and remembered - it's the bittersweet beauty of summer love and youthful freedom captured before it fades - evokes Lana Del Rey's romantic melancholy mixed with Ralph Lauren's aspirational Americana - viewer feels both happiness and longing - desire to be there and recognition that such moments exist primarily in memory and imagination - fundamentally optimistic but tinged with beautiful sadness",
  },
  {
    id: "photostyle_002",
    title: "High-Fashion Cinematic Transcend",
    prompt: "High-Fashion Editorial with Cinematic Composition: This photography style draws from world of high-end fashion magazines and editorial campaigns combining technical excellence with artistic vision to create images that transcend simple documentation. Approach is characterized by careful attention to composition with subject placed deliberately within frame according to principles like rule of thirds leading lines and negative space. Every element within frame is considered and intentional. Lighting is sophisticated and controlled often combining multiple sources. Post-processing is significant part of style with images typically undergoing color grading retouching and refinement",
  },
  {
    id: "photostyle_003",
    title: "Candid Documentary Snapshot Aesthetic",
    prompt: "Lifestyle Photography with Candid Documentary Feel: This style aims to capture authentic moments and genuine emotion while still maintaining high production value and aesthetic sophistication. Unlike strictly posed editorial photography lifestyle approach seeks to show subject in relatable situation engaged in recognizable activity or expressing genuine feeling. Camera work often mimics snapshot aesthetic - slightly off-center framing captured mid-motion or shot from unexpected angle that suggests photographer stumbled upon moment rather than carefully constructing it",
  },
  {
    id: "photostyle_004",
    title: "Analog Grain Roll-Off",
    prompt: "Film Photography Aesthetic with Analog Qualities: This style either literally uses film photography or deliberately emulates its distinctive characteristics through digital means embracing particular aesthetic qualities that define analog image-making. Hallmark is presence of grain that organic random texture visible across image. Color rendering in film has distinctive character that differs from digital capture. Dynamic range in film differs - highlights tend to roll off gracefully maintaining detail and color even in bright areas. Film also has characteristic flaws that become part of aesthetic appeal",
  },
  {
    id: "photostyle_005",
    title: "Miniature World Focus-Stacking",
    prompt: "Studio Diorama Miniature Realism: Meticulous photography of carefully constructed miniature scenes or highly controlled composite work using medium format digital cameras for ultimate detail and dynamic range - macro lenses capturing intricate details with focus-stacking for comprehensive depth of field - controlled studio lighting with softboxes strobes and atmospheric effects creating enchanted quality - significant post-processing for color grading atmospheric enhancement and element compositing - sharp detailed foreground against softly blurred ethereal background creating sensation of peering into perfectly crafted miniature world",
  },
  {
    id: "photostyle_006",
    title: "Naturalistic Overlooked Details",
    prompt: "Naturalistic Documentary High-Resolution: Authentic capture of natural scenes with emphasis on texture detail and organic beauty using high-end smartphone computational photography or full-frame digital cameras with macro lenses - natural diffused daylight providing soft even illumination that reveals subtle textures and colors - high-angle intimate perspectives emphasizing intricate patterns - minimal post-processing focusing on enhancing natural sharpness contrast and color balance - style celebrates raw unmanipulated beauty of small ecosystems and overlooked details",
  },
  {
    id: "photostyle_007",
    title: "iPhone Casual Degraded Snapshot",
    prompt: "Simulate a casually captured iPhone photograph taken in suboptimal lighting conditions embodying the authentic unfiltered reality aesthetic of a quick text-message snap rather than a polished edit. Dynamic range is severely compressed with crushed highlights that clip to flat white and lifted shadows that reveal chunky colorful sensor noise characteristic of a small phone sensor struggling in mixed artificial light. Overall image exhibits a slight atmospheric haze and reduced micro-contrast as if shot through a smudged or fingerprinted lens element with subtle light scatter softening edges throughout. Color science feels distinctly off with an unpleasant green-magenta tint from incorrect auto white balance — skin tones appear slightly dull waxy and desaturated leaning towards sickly yellow-orange with reduced luminosity rather than warm and inviting. Fine surface detail is smeared by aggressive computational noise reduction creating a watercolor-like smoothing effect on textures while simultaneously over-sharpening high-contrast edges producing visible halos and ringing artifacts reminiscent of heavy JPEG compression. Heavy corner vignetting darkens the frame edges dramatically mimicking the optical falloff of a cheap wide-angle phone lens — light falls off rapidly from center creating a tunnel-vision effect. A blown-out lens flare bleeds from one corner where an overhead light source catches the lens coating producing a purple-green chromatic fringe that washes across a quarter of the frame reducing local contrast. The overall image feels accidentally composed with awkward framing slight motion blur from hand tremor and the particular flatness that comes from a phone sensor's limited photon gathering ability — everything about it communicates spontaneous imperfect authenticity as if pulled from someone's camera roll among hundreds of similar throwaway shots",
  },
  {
    id: "photostyle_008",
    title: "Forensic Realism Hyper-Detail",
    prompt: "Render this portrait with forensic-grade hyper-realistic detail that passes scrutiny at extreme magnification — every square millimeter must reveal plausible non-repeating real-world texture as if documenting a living breathing human being rather than generating a digital construct. Skin texture features a complete stochastic pore map with deliberate size variation — larger visible pores concentrated around the nose and cheek centers transitioning to medium pores across most of the face and barely-visible fine pores along the forehead and jawline — each pore casting its own micro-shadow with high-frequency micro-contrast revealing where subsurface scattering breaks around individual skin structures creating dimensional porcelain-like skin that is textured and clean without blemishes or freckling. Hair is rendered as individually placed physical fibers — eyebrows composed of hundreds of distinct hairs varying in thickness growing thinner at the tails with varying length transparency and occasional rogue hairs straying outside the main arch each emerging from a slightly darker more defined root point visible against skin — eyelashes cluster naturally in groups of three to five rather than forming a uniform fringe with upper lashes denser and lower lashes sparse and fine — flyaway hairs escape the main hair form backlit by the key light creating a luminous halo effect each strand showing slight wave or kink at one to three pixels diameter. Eyes are modeled as multi-layered moist biological organs — iris fibers radiate from the pupil with varying thickness and color density overlaid with a cryptic fractal mesh pattern — a slightly jagged limbal ring defines the iris-sclera boundary — scleral whites carry a microscopic red-blue tint from underlying vasculature with two to four subtle thread-like blood vessels originating from the corners fading before reaching the iris — a complex distorted environmental reflection maps across the corneal bulge with a visible tear line along the lower eyelid catching light as a thin wet highlight. Skin specularity follows a physically-based selective map — soft broad highlights on forehead nose bridge cheekbones and chin with zero direct shine in the philtrum inner cheek hollows and orbital area — pinpoint specular hits on individual brow hair peaks eyelash edges the moist inner eye corner and the vermillion lip border. Subsurface scattering is critical — light diffuses through thin cartilage and flesh at the ears nostrils and thinner cheek areas producing a soft warm red-glow transmission effect. Facial asymmetry is subtly present — one eyebrow microscopically higher than the other one pupil imperceptibly larger nasolabial folds slightly uneven. Fine colorless grain structure consistent with a full-frame sensor at ISO 100 covers the image with microscopic red-cyan chromatic aberration fringing on the highest contrast edges and three to ten atmospheric dust particles caught by the key light floating out of focus in the air. The overall result must feel unmistakably photographic — not rendered not retouched not smoothed — a forensic-quality document of genuine human biology captured by a high-resolution professional camera system",
  },
];
